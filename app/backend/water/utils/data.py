from django.db import models
import logging
from water import models as m
from collections import defaultdict
from rest_framework import serializers
from django.db.models import OuterRef, Subquery, Max, Sum, Avg, Value, Count, Q
from django.db.models.functions import Coalesce
import numpy as np
import pandas as pd

log = logging.getLogger(__name__)


def get_reservoir_data():
    date_latest = "2024-09-01"
    most_recent_volume = (
        m.ReservoirState.objects.filter(reservoir=OuterRef("pk"), date=date_latest)
        .order_by()
        .values("volume")[:1]
    )

    reservoirs = m.Reservoir.objects.annotate(
        num_states=Count("reservoir_reservoirstate"),
        volume_latest=Coalesce(Subquery(most_recent_volume), 0.0),
    )
    return reservoirs


class StatesMaterialized(models.Model):
    date = models.DateField()
    volume = models.FloatField()
    reservoir_id = models.IntegerField()
    reservoir_uuid = models.UUIDField()
    reservoir_name = models.CharField(max_length=255)
    capacity = models.FloatField()
    name_full = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    region_id = models.UUIDField()
    region_name = models.CharField(max_length=255)
    has_rainfall = models.BooleanField()
    rainfall_amount = models.FloatField()
    rainfall_cumulative = models.FloatField()
    rainfall_cumulative_historical = models.FloatField()
    one = models.IntegerField()

    class Meta:
        managed = False
        db_table = "water_statesmaterialized"


class StatesMaterializedSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatesMaterialized
        fields = "__all__"


def get_date_filter(filter_type):
    if filter_type == "year":
        return Q(date__day=30) & Q(date__month=9)

    if filter_type == "month":
        return Q(date__day=1)

    if filter_type == "day":
        return Q()


def get_wide_data(num_obs, start_date, end_date, filter_type, reservoir_uuids):
    print("reservoir_uuids", reservoir_uuids)
    filter_first = get_date_filter(filter_type)
    allvals = StatesMaterialized.objects
    filtered_date = allvals.filter(date__gte=start_date, date__lte=end_date)
    filtered_reservoir = filtered_date.filter(reservoir_uuid__in=reservoir_uuids)
    filtered = filtered_reservoir.filter(filter_first)

    print(f"Counts: {len(filtered_date)}, {len(filtered_reservoir)}, {len(filtered)}")
    return filtered[0:num_obs]


def group_query_by(query, group_vars):

    grouped = {}
    for row in query:
        rowvals = row.__dict__
        key = tuple([rowvals[var] for var in group_vars])
        if key not in grouped:
            grouped[key] = []
        grouped[key].append(row)

    return grouped


class DataAgg(models.Model):
    id = models.IntegerField(primary_key=True)
    date = models.DateField()
    group_var_name = models.CharField(max_length=255)
    group_var = models.CharField(max_length=255)
    capacity = models.FloatField()
    volume = models.FloatField()
    rainfall_amount = models.FloatField()
    rainfall_cumulative = models.FloatField()
    rainfall_cumulative_historical = models.FloatField()
    reservoir_id = models.IntegerField()
    reservoir_uuid = models.UUIDField()
    has_rainfall = models.BooleanField(default=True)

    class Meta:
        managed = False


class DataAggSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataAgg
        fields = "__all__"


def get_data_agg(group_var, row):
    return DataAgg(
        id=row["id"],
        date=row["date"],
        group_var_name=group_var,
        group_var=row["group_var"],
        capacity=row["capacity"],
        volume=row["volume"],
        rainfall_amount=row["rainfall_amount"],
        rainfall_cumulative=row["rainfall_cumulative"],
        rainfall_cumulative_historical=row["rainfall_cumulative_historical"],
    )


def get_wide_data_agg(num_obs, start_date, end_date, filter_type, group_var):

    filter_first = get_date_filter(filter_type)
    allvals = StatesMaterialized.objects
    filtered_date = allvals.filter(date__gte=start_date, date__lte=end_date)
    print(len(filtered_date))
    filtered = filtered_date.filter(filter_first)

    print(len(filtered))
    values_group = filtered.values(group_var)
    df = pd.DataFrame(filtered.values())
    groupvars = [group_var, "date"]

    df["obs"] = 1

    cols_sum = [
        "volume",
        "rainfall_amount",
        "rainfall_cumulative",
        "rainfall_cumulative_historical",
        "capacity",
        "obs",
    ]

    print(df.columns)

    grouped_df = df.groupby(groupvars)[cols_sum].sum().reset_index()
    grouped_df["id"] = range(1, len(grouped_df) + 1)
    grouped_df["group_var"] = grouped_df[group_var]
    grouped_df["group_var_name"] = group_var

    grouped_df["capacity_max"] = grouped_df["capacity"].max()

    grouped_df = grouped_df[grouped_df.capacity >= 0.5 * grouped_df.capacity_max]

    rows = [get_data_agg(group_var, row) for index, row in grouped_df.iterrows()]
    return rows[0:num_obs]


def query_to_geojson(query, properties_getter):
    def get_feature(geo):
        return {
            "type": "Feature",
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": geo.geometry.coords,
            },
            "properties": properties_getter(geo),
        }

    features = [get_feature(geo) for geo in query]
    geojson = {
        "type": "FeatureCollection",
        "features": features,
    }

    return geojson


def get_regions_geojson(filter_to_reservoir=True):
    regions_geo = m.Region.objects.all()

    if filter_to_reservoir:
        reservoirs = m.Reservoir.objects.all()

        def get_reservoirs_in_region(region):
            return reservoirs.filter(
                reservoir_geo_reservoir__geometry__contained=region.geometry
            )

        regions_geo = [
            region for region in regions_geo if get_reservoirs_in_region(region)
        ]

    def properties_getter(geo):
        return {
            "name": geo.name,
            "uuid": str(geo.uuid),
        }

    return query_to_geojson(regions_geo, properties_getter)


def get_reservoirs_geojson():
    reservoirs_geo = m.ReservoirGeo.objects.all()

    def properties_getter(geo):
        reservoir = geo.reservoir
        return {
            "name": reservoir.name,
            "name_full": reservoir.name_full,
            "reservoir_uuid": str(reservoir.uuid),
        }

    return query_to_geojson(reservoirs_geo, properties_getter)
