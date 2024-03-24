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


def get_rainfall_data(
    num_obs, start_date, end_date, is_first_of_month, reservoir_uuids
):
    states = RainFall.objects.all()

    assert len(states) > 0
    if reservoir_uuids:
        reservoir_list = reservoir_uuids.split(",")
        states = states.filter(reservoir__uuid__in=reservoir_list)

    if start_date and end_date:
        states = states.filter(date__gte=start_date, date__lte=end_date).order_by(
            "reservoir__uuid", "date"
        )

    states = states[0:num_obs]
    return states


def get_reservoir_states_data(
    num_obs, start_date, end_date, is_first_of_month, reservoir_uuids
):
    states = ReservoirState.objects.all()
    log.info(f"states: {len(states)}")
    if start_date and end_date:
        states = states.filter(date__gte=start_date, date__lte=end_date).order_by(
            "reservoir__uuid", "date"
        )
    log.info(f"after dates: {len(states)}")
    if is_first_of_month:
        states = states.filter(date__day=1).order_by("reservoir__uuid", "date")
    log.info(f"after firts: {len(states)}")
    if reservoir_uuids:
        reservoir_list = reservoir_uuids.split(",")
        states = states.filter(reservoir__uuid__in=reservoir_list)
    log.info(f"after reservoir: {len(states)}")
    states = states[0:num_obs]

    return states


def get_reservoir_data():
    reservoirs = Reservoir.objects.annotate(
        num_states=Count("reservoir_reservoirstate")
    )
    return reservoirs


def get_daily_data(num_obs, start_date, end_date, is_first_of_month, reservoir_uuids):

    # Create a table that's a full outer join of the ReservoirState and RainFall tables
    # join on the date and reservoir_uuid columns
    # use the ORM to create the join
    states = get_reservoir_states_data(
        num_obs, start_date, end_date, is_first_of_month, reservoir_uuids
    )
    rainfall = get_rainfall_data(
        num_obs, start_date, end_date, is_first_of_month, reservoir_uuids
    )

    assert len(rainfall) > 0

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
    for key, value in combined_group.items():
        expanded.append(
            {
                "date": key[0],
                "reservoir": value["ReservoirState"].reservoir,
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
