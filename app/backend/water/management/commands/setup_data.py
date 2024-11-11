from django.core.management.base import BaseCommand, CommandError

import difflib
import pandas as pd
import geopandas as gpd
from water.models import (
    ReservoirState,
    ReservoirGeo,
    Reservoir,
    ReservoirStateSerializer,
    RainFall,
    Region,
)
from django.db.models import Count
from water.utils import parse as p
import argparse
from django.contrib.gis.geos import Polygon, LinearRing
import logging
import os
from water.utils import helpers

log = logging.getLogger(__name__)

ds_start = "2012-09-01"
provinces_default = ["malaga", "cadiz"]
crs_default = "EPSG:4326"

BUCKET = "andalucianwater"

locations_s3 = {
    "states_table": f"{p.folder_data}/datasets/all_parsed_cleaned.csv",
    "demarcaciones": f"{p.folder_data}/raw/demarcaciones",
    "reservoirs_geo": f"{p.folder_data}/raw/reservoirs.gpkg",
}

PRECISION_NUM = 0.001


def standardize_gdf(gdf_raw, precision_num=PRECISION_NUM):
    gdf = gdf_raw.copy()
    gdf = gdf.to_crs(crs_default)
    gdf.geometry = gdf.geometry.simplify(precision_num)
    return gdf


def copy_s3(location_from, location_to, recursive=False, overwrite=False):
    if not overwrite and os.path.exists(location_to):
        log.info(f"File {location_to} already exists. Skipping.")
        return

    recursive_str = "--recursive" if recursive else ""
    cmd_copy_s3 = (
        f"aws s3 cp s3://{BUCKET}/{location_from} {location_to} {recursive_str}"
    )
    os.system(cmd_copy_s3)


def get_tmp_file(name):
    return f"/tmp/{name}"


def get_regions_raw():
    key = "demarcaciones"
    folder_tmp = get_tmp_file(key)
    # copy_s3(locations_s3[key], folder_tmp, recursive=True)
    return gpd.read_file(locations_s3[key])


def get_data_reservoirs_geo():
    key = "reservoirs_geo"
    location_tmp = get_tmp_file(key)
    # copy_s3(locations_s3[key], location_tmp)
    return gpd.read_file(locations_s3[key])


def get_data():
    key = "states_table"
    location_tmp = get_tmp_file(key)
    # copy_s3(locations_s3[key], location_tmp)
    df = pd.read_csv(locations_s3[key])
    return pick_yearly(df)


def read_reservoir_geo():
    gdf = get_data_reservoirs_geo()
    name_geo = gdf[gdf.nombre.notnull()].nombre.unique()
    names_geo_dict = {name: clean_name(name) for name in name_geo}
    return (gdf, names_geo_dict)


def get_df(num_states, prod):
    df_all_raw = get_data()
    log.info(df_all_raw.groupby("province").reservoir.count())

    capacities = (
        df_all_raw.groupby(["province", "reservoir"])["capacity_hm3"]
        .agg(["last", "nunique"])
        .reset_index()
    )
    if not prod:
        capacities = capacities[capacities.province.isin(provinces_default)].copy()
    capacities = capacities.sort_values("last", ascending=False)
    df_store = df_all_raw[df_all_raw.reservoir.isin(capacities.reservoir.unique())]
    df_store = df_store[df_store.ds >= ds_start].copy()
    return df_store


def store_map(gdf_raw, df_matches):

    ReservoirGeo.objects.all().delete()

    # Delete the name_full from all reservoirs
    Reservoir.objects.all().update(name_full=None)

    gdf = gdf_raw[gdf_raw.nombre.isin(df_matches["name_geo_full"])].copy()

    dict_matches = df_matches.set_index("name_geo_full")["name_df"].to_dict()
    name_to_full = {v: k for (k, v) in dict_matches.items()}

    # Approach: Try getting the reservoir by name. If it exists, add the
    # full name. If not, create a new reservoir with empty name.

    reservoirs = Reservoir.objects.all()
    reservoirs_dict = {reservoir.name: reservoir.uuid for reservoir in reservoirs}

    gdf["name_data"] = [dict_matches[n] for n in gdf.nombre]
    gdf["reservoir_uuid"] = [reservoirs_dict.get(name) for name in gdf["name_data"]]

    gdf = standardize_gdf(gdf)
    gdf = gdf[gdf.reservoir_uuid.notnull()].copy()

    gdf_store = gdf[["nombre", "reservoir_uuid", "geometry"]].rename(
        columns={"nombre": "name"}
    )

    for _, row in gdf_store.iterrows():
        reservoir = Reservoir.objects.get(uuid=row["reservoir_uuid"])
        reservoir.name_full = row["name"]
        reservoir.save()
        polygon_shapely = row["geometry"]
        mp = helpers.to_django_multipolygon_any(polygon_shapely)
        ReservoirGeo.objects.create(reservoir=reservoir, geometry=mp)


def clean_name(name):
    replace_vals = ["embalse del ", "embalse de ", "embalse "]
    for val in replace_vals:
        name = name.lower().replace(val, "")
    return name


def pick_yearly(df):
    df_monthly = df[df.ds.str.slice(5, 10) == "09-01"].copy()
    return df_monthly


def pick_monthly(df):
    df_monthly = df[df.ds.str.slice(8, 10) == "01"].copy()
    return df_monthly


def diffnum_difflib(a, b):
    diff = difflib.ndiff(a, b)
    diff = list(diff)
    diff = [x for x in diff if x[0] != " "]
    return len(diff)


def prepare_for_rain(df_all_raw):
    df_all = df_all_raw.copy()
    df_all["date_lag"] = df_all.groupby(["province", "reservoir"])["date"].shift(1)
    df_all["date_diff"] = (df_all.date - df_all.date_lag).dt.days

    cols = ["rainfallsince", "stored_hm3", "capacity_hm3"]
    for var in ["rainfallsince", "stored_hm3"]:
        df_all[f"{var}_diff"] = df_all.groupby(["province", "reservoir"])[var].diff()
        df_all[f"{var}_diff_0"] = df_all[f"{var}_diff"]
        for lags in range(1, 10):
            df_all[f"{var}_diff_{lags}"] = df_all.groupby(["province", "reservoir"])[
                f"{var}_diff"
            ].shift(lags)
    return df_all


def get_matched_names(df, names_geo_dict):
    name_df = df.reservoir.unique()
    df_matches = pd.DataFrame(columns=["name_df", "name_geo", "diff"])
    df_matches["name_df"] = name_df
    geo_clean = list(names_geo_dict.values())

    for i, name in enumerate(name_df):
        diffs = []
        for j, name2 in enumerate(geo_clean):
            diffs.append(diffnum_difflib(name, name2))
        df_matches["diff"].iloc[i] = min(diffs)
        df_matches["name_geo"].iloc[i] = geo_clean[diffs.index(min(diffs))]

    df_matches["name_geo_full"] = df_matches["name_geo"].map(
        {v: k for k, v in names_geo_dict.items()}
    )
    return df_matches


def region_name_cleaned(region_name):
    # The input is something like CUENCAS MEDITERRÁNEAS
    # Turn it into Cuencas Mediterráneas
    return region_name.title()


def store_regions():
    gdf = get_regions_raw()

    gdf = standardize_gdf(gdf)

    renamer = {"Nombre": "name"}
    gdf_store = gdf.rename(columns=renamer)[["name", "geometry"]]

    def get_region(row):
        mp = helpers.to_django_multipolygon_any(row["geometry"])
        return Region(name=region_name_cleaned(row["name"]), geometry=mp)

    Region.objects.all().delete()
    regions_to_save = gdf_store.apply(get_region, axis=1)
    Region.objects.bulk_create(regions_to_save.tolist())

    reservoir_geos = ReservoirGeo.objects.all()
    regions = Region.objects.all()

    # For each reservoir geo, get the region that contains it
    # and store this region in the reservoir
    for reservoir_geo in reservoir_geos:
        for region in regions:
            if region.geometry.contains(reservoir_geo.geometry):
                reservoir = reservoir_geo.reservoir
                reservoir.region = region
                reservoir.save()
                break


def store_to_db(df):
    ReservoirState.objects.all().delete()
    Reservoir.objects.all().delete()

    capacities = (
        df.groupby(["province", "reservoir"])["capacity_hm3"]
        .agg(["last", "nunique"])
        .reset_index()
    )

    log.info("Storing reservoirs")

    def get_reservoir(row):
        return Reservoir(
            name=row["reservoir"],
            province=row["province"],
            capacity=row["last"],
        )

    reservoirs_to_create = capacities.apply(get_reservoir, axis=1).tolist()
    log.info(reservoirs_to_create[0].name)

    Reservoir.objects.bulk_create(reservoirs_to_create)

    log.info("Storing states")
    reservoirs_data = Reservoir.objects.all()
    reservoir_for_name = {reservoir.name: reservoir for reservoir in reservoirs_data}

    def get_reservoir_state(row):
        reservoir = reservoir_for_name[row["reservoir"]]
        return ReservoirState(
            reservoir=reservoir, date=row["ds"], volume=row["stored_hm3"]
        )

    reservoir_states_to_create = df.apply(get_reservoir_state, axis=1).tolist()
    ReservoirState.objects.bulk_create(reservoir_states_to_create)

    log.info("Storing rain")

    df_all = prepare_for_rain(p.add_cols(df))

    # Delete all rainfall objects
    RainFall.objects.all().delete()

    # Get all reservoirs with state data
    reservoirs = Reservoir.objects.annotate(
        num_states=Count("reservoir_reservoirstate")
    ).filter(num_states__gt=0)

    reservoir_names = reservoirs.values_list("name", flat=True)

    def get_rainfall(row):
        return RainFall(
            date=row["ds"],
            reservoir=reservoir_for_name[row["reservoir"]],
            amount=row["rainfallsince_diff"],
            amount_cumulative=row["rainfallsince"],
            amount_cumulative_historical=row["avgrainfall1971_2000"],
        )

    rainfalls_to_store = (
        df_all[df_all.reservoir.isin(reservoir_names)]
        .apply(get_rainfall, axis=1)
        .tolist()
    )

    RainFall.objects.bulk_create(rainfalls_to_store)

    log.info("Done rain")


class Command(BaseCommand):
    help = "Adds the data"

    def add_arguments(self, parser):
        parser.add_argument("--env", type=str, default="dev")
        parser.add_argument("--num", type=int, default=10)
        parser.add_argument("--overwrite-s3", type=bool, default=False)
        parser.add_argument(
            "--handle-map", action=argparse.BooleanOptionalAction, default=True
        )
        parser.add_argument(
            "--handle-db", action=argparse.BooleanOptionalAction, default=True
        )

    def handle(self, *args, **options):
        # Get num from the args
        num_states = options["num"]
        prod = options["env"] == "prod"
        handle_map = options["handle_map"]
        handle_db = options["handle_db"]

        df_store = get_df(num_states, prod)
        log.info("Storing data of size: " + str(df_store.shape))

        if handle_db:
            store_to_db(df_store)

        if handle_map:
            (gdf_raw, names_geo_dict) = read_reservoir_geo()
            df_matches = get_matched_names(df_store, names_geo_dict)
            store_map(gdf_raw, df_matches)
            store_regions()
