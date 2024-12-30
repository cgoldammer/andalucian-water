from django.db import models
from django.db.models import Count
from django.db.models import Q
import logging
from water import models as m
from collections import defaultdict
from rest_framework import serializers
from django.db.models import OuterRef, Subquery, Max
from django.db.models.functions import Coalesce

log = logging.getLogger(__name__)


def get_filters(q, num_obs, start_date, end_date, is_first_of_year, reservoir_uuids):
    q_new = q.filter(date__gte=start_date, date__lte=end_date).order_by(
        "reservoir__uuid", "date"
    )
    if is_first_of_year:
        q_new = (
            q_new.filter(date__day=1)
            .filter(date__month=9)
            .order_by("reservoir__uuid", "date")
        )
    q_new = q_new.filter(reservoir__uuid__in=reservoir_uuids)
    return q_new


def get_reservoir_states_data(
    num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
):
    log.info("Getting states")
    states = m.ReservoirState.objects.all()
    return get_filters(
        states, num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
    )


def get_rainfall_data(num_obs, start_date, end_date, is_first_of_year, reservoir_uuids):
    states = m.RainFall.objects.all()

    return get_filters(
        states, num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
    )


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

    class Meta:
        managed = False
        db_table = "water_statesmaterialized"


class StatesMaterializedSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatesMaterialized
        fields = "__all__"


def get_wide_data(num_obs, start_date, end_date, is_first_of_year, reservoir_uuids):

    filter_first_of_year = Q(date__day=1) & Q(date__month=9)
    filter_first = filter_first_of_year if is_first_of_year else Q()

    from django.db.models import Min, Max

    date_range_materialized = StatesMaterialized.objects.aggregate(
        min_date=Min("date"), max_date=Max("date")
    )

    allvals = StatesMaterialized.objects
    filtered_date = allvals.filter(date__gte=start_date, date__lte=end_date)
    filtered_reservoir = filtered_date.filter(reservoir_uuid__in=reservoir_uuids)
    filtered = filtered_reservoir.filter(filter_first)

    print(
        f"Counts: {allvals.count()} {filtered_date.count()} {filtered_reservoir.count()} {filtered.count()}"
    )

    return filtered[0:num_obs]


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
