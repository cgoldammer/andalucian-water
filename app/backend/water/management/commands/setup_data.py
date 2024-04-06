from django.core.management.base import BaseCommand, CommandError

import difflib
import pandas as pd
import geopandas as gpd
from water.models import ReservoirState, Reservoir, ReservoirStateSerializer, RainFall
from django.db.models import Count
from water.utils import parse as p

ds_start = "2012-09-01"
province_default = "malaga"

BUCKET = "andalucianwater"

folder_data = "water/data_raw"
filename_data = f"{folder_data}/all_parsed_cleaned.csv"
filename_geo = f"{folder_data}/reservoirs.gpkg"
replace_vals = ["embalse del ", "embalse de ", "embalse "]


def clean_name(name):
    for val in replace_vals:
        name = name.lower().replace(val, "")
    return name


def pick_monthly(df):
    df_monthly = df[df.ds.str.slice(8, 10) == "01"].copy()
    return df_monthly


def get_data():
    df = pd.read_csv(filename_data)
    return pick_monthly(df)


def read_reservoir_geo():
    gdf_raw = gpd.read_file(filename_geo)
    name_geo = gdf_raw[gdf_raw.nombre.notnull()].nombre.unique()
    names_geo_dict = {name: clean_name(name) for name in name_geo}

    return (gdf_raw, names_geo_dict)


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


def get_matched_names(df_all_raw, names_geo_dict):
    name_df = df_all_raw.reservoir.unique()
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


class Command(BaseCommand):
    help = "Adds the data"
    # print("hello")

    def add_arguments(self, parser):
        parser.add_argument("--env", type=str, default="dev")
        parser.add_argument("--num", type=int, default=10)

    def handle(self, *args, **options):
        print("Args", args, options)

        # Get num from the args
        num_states = options["num"]
        prod = options["env"] == "prod"
        print("Prod", prod)

        df_all_raw = get_data()
        (gdf_raw, names_geo_dict) = read_reservoir_geo()
        df_matches = get_matched_names(df_all_raw, names_geo_dict)
        dict_matches = df_matches.set_index("name_geo_full")["name_df"].to_dict()

        capacities = (
            df_all_raw.groupby(["province", "reservoir"])["capacity_hm3"]
            .agg(["last", "nunique"])
            .reset_index()
        )

        print("Raw", df_all_raw.shape)

        print(df_all_raw.groupby("province").reservoir.count())

        # For dev run, just sample one province
        if not prod:
            capacities = capacities[capacities.province == province_default].copy()

        name_to_full = {v: k for (k, v) in dict_matches.items()}

        capacities = capacities.sort_values("last", ascending=False)
        capacities = capacities[capacities.reservoir.isin(name_to_full.keys())]

        df_selected = df_all_raw[
            df_all_raw.reservoir.isin(capacities.reservoir.unique())
        ]
        df_selected = df_selected[df_selected.ds >= ds_start].copy()

        ReservoirState.objects.all().delete()
        Reservoir.objects.all().delete()

        for _, row in capacities.iterrows():
            name = row["reservoir"]
            province = row["province"]
            name_full = name_to_full[name]
            reservoir = Reservoir.objects.create(
                name=row["reservoir"],
                name_full=name_full,
                province=province,
                capacity=row["last"],
            )
            reservoir.save()

        for _, row in df_selected.head(num_states).iterrows():
            reservoir = Reservoir.objects.get(name=row["reservoir"])
            state = ReservoirState.objects.create(
                reservoir=reservoir,
                date=row["ds"],
                volume=row["stored_hm3"],
            )
            state.save()

        df_all = prepare_for_rain(p.add_cols(df_selected))

        # Delete all rainfall objects
        RainFall.objects.all().delete()

        # Get all reservoirs with state data
        reservoirs = Reservoir.objects.annotate(
            num_states=Count("reservoir_reservoirstate")
        ).filter(num_states__gt=0)

        reservoir_names = reservoirs.values_list("name", flat=True)

        for _, row in (
            df_all[df_all.reservoir.isin(reservoir_names)].head(num_states).iterrows()
        ):
            reservoir = Reservoir.objects.get(name=row["reservoir"])
            rainfall = RainFall.objects.create(
                date=row["ds"],
                reservoir=reservoir,
                amount=row["rainfallsince_diff"],
                amount_cumulative=row["rainfallsince"],
                amount_cumulative_historical=row["avgrainfall1971_2000"],
            )

        reservoirs = Reservoir.objects.all()
        reservoirs = reservoirs.values_list("name", "uuid")
        reservoirs_dict = {name: str(uuid) for name, uuid in reservoirs}

        filename = "water/data/reservoirs.json"
        gdf = gdf_raw[gdf_raw.nombre.isin(df_matches["name_geo_full"])].copy()
        gdf["name_data"] = [dict_matches[n] for n in gdf.nombre]
        gdf["reservoir_uuid"] = [reservoirs_dict.get(name) for name in gdf["name_data"]]
        gdf.geometry = gdf.geometry.simplify(100)
        # Turn this into a geo crs
        gdf = gdf.to_crs("EPSG:4326")

        gdf = gdf[gdf.reservoir_uuid.notnull()].copy()

        gdf.to_file(filename, driver="GeoJSON")

        # Print reservoirState objects
        print("States")
        print(ReservoirState.objects.count())
