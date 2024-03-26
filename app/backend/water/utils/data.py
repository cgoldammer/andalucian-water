from ..models import (
    Inquiry,
    Reservoir,
    RainFall,
    ReservoirState,
    ReservoirSerializer,
    ReservoirStateSerializer,
    RainFallSerializer,
)
from django.db.models import Count
import logging
from ..models import ReservoirSerializer
from collections import defaultdict
from rest_framework import serializers

log = logging.getLogger(__name__)


def get_filters(q, num_obs, start_date, end_date, is_first_of_year, reservoir_uuids):
    log.info("Num at start: %s", q.count())
    q = q.filter(date__gte=start_date, date__lte=end_date).order_by(
        "reservoir__uuid", "date"
    )
    if is_first_of_year:
        q = (
            q.filter(date__day=1)
            .filter(date__month=9)
            .order_by("reservoir__uuid", "date")
        )

    log.info("Num after first: %s", q.count())
    reservoir_list = reservoir_uuids.split(",")
    q = q.filter(reservoir__uuid__in=reservoir_list)
    return q


def get_reservoir_states_data(
    num_obs, start_date, end_date, is_first_of_year, reservoir_uuids
):
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
    reservoirs = Reservoir.objects.annotate(
        num_states=Count("reservoir_reservoirstate")
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
