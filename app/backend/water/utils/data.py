from ..models import (
    Reservoir,
    RainFall,
    ReservoirState,
    ReservoirGeo,
    ReservoirSerializer,
    ReservoirStateSerializer,
    RainFallSerializer,
)
from django.db.models import Count
import logging
from ..models import ReservoirSerializer
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
    states = ReservoirState.objects.all()
    return get_filters(
        states, num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
    )


def get_rainfall_data(num_obs, start_date, end_date, is_first_of_year, reservoir_uuids):
    states = RainFall.objects.all()

    return get_filters(
        states, num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
    )


def get_reservoir_data():
    date_latest = "2023-09-01"
    most_recent_volume = (
        ReservoirState.objects.filter(reservoir=OuterRef("pk"), date=date_latest)
        .order_by()
        .values("volume")[:1]
    )

    reservoirs = Reservoir.objects.annotate(
        num_states=Count("reservoir_reservoirstate"),
        volume_latest=Coalesce(Subquery(most_recent_volume), 0.0),
    )
    return reservoirs


def get_wide_data(num_obs, start_date, end_date, is_first_of_year, reservoir_uuids):

    # Create a table that's a full outer join of the ReservoirState and RainFall tables
    # join on the date and reservoir_uuid columns
    # use the ORM to create the join
    log.info("Getting wide data")

    states = get_reservoir_states_data(
        num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
    )
    rainfall = get_rainfall_data(
        num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
    )

    def group_records(records):
        grouped = defaultdict(lambda: {"Rainfall": None, "ReservoirState": None})
        for record in records:
            key = (record.date, record.reservoir.uuid)
            grouped[key] = record
        return grouped

    rainfall_grouped = group_records(rainfall)
    reservoir_grouped = group_records(states)

    if states.count() == 0:
        print("GROUPED")
        print(reservoir_grouped)
        return []

    # Step 3: Combine the groups to achieve a full outer join effect
    combined_group = defaultdict(lambda: {"Rainfall": None, "ReservoirState": None})
    for key in set(rainfall_grouped) | set(reservoir_grouped):  # Union of keys
        if key in rainfall_grouped:
            combined_group[key]["Rainfall"] = rainfall_grouped[key]
        if key in reservoir_grouped:
            combined_group[key]["ReservoirState"] = reservoir_grouped[key]

    expanded = []
    for key, value in sorted(combined_group.items()):

        if not value["ReservoirState"] or not value["Rainfall"]:
            continue

        reservoir = value["ReservoirState"].reservoir

        expanded.append(
            {
                "date": key[0],
                "reservoir": reservoir,
                "rainfall": value["Rainfall"],
                "reservoir_state": value["ReservoirState"],
            }
        )
    return expanded


# Create a serializer for the combined_group dictionary
# The dictionary has a key of (date_reservoir_uuid)
# And the values of Rainfall and ReservoirState
class DailyDataSerializer(serializers.Serializer):
    date = serializers.DateField()
    reservoir = ReservoirSerializer()
    rainfall = RainFallSerializer()
    reservoir_state = ReservoirStateSerializer()

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


def get_reservoirs_geojson():

    reservoirs_geo = ReservoirGeo.objects.all()

    features = []
    for reservoir_geo in reservoirs_geo:
        reservoir = reservoir_geo.reservoir
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": reservoir_geo.geometry.coords[0],
            },
            "properties": {
                "name": reservoir.name,
                "name_full": reservoir.name_full,
                "reservoir_uuid": str(reservoir.uuid),
            },
        }
        features.append(feature)
    geojson = {
        "type": "FeatureCollection",
        "features": features,
    }

    return geojson
