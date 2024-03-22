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

log = logging.getLogger(__name__)


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
