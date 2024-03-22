from water.models import Reservoir, ReservoirState
import random
import pandas as pd


NUM_RESERVOIRS = 2

date_start = "2023-01-01"
date_end = "2023-01-05"


def fill_simple(
    num_reservoirs=NUM_RESERVOIRS, date_start=date_start, date_end=date_end
):

    for i in range(num_reservoirs):
        reservoir = Reservoir(name=f"reservoir_{i}", capacity=random.uniform(0, 100))
        reservoir.save()

        for date in pd.date_range(date_start, date_end):
            state = ReservoirState(
                date=date, volume=random.uniform(0, 100), reservoir=reservoir
            )
            state.save()
