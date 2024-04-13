from water.models import Reservoir, ReservoirState, RainFall, Region, ReservoirGeo
import random
import pandas as pd
from django.contrib.gis.geos import Polygon, LinearRing, MultiPolygon
from water.utils import helpers


NUM_RESERVOIRS = 2

date_start = "2023-01-01"
date_end = "2023-01-05"

location_spain = (40.2085, -3.7130)


def get_random_point():
    # Start from location_spain
    lat = location_spain[0] + random.uniform(-1, 1)
    long = location_spain[1] + random.uniform(-1, 1)
    return lat, long


def get_random_multipolygon():
    points = [get_random_point() for _ in range(5)]
    points.append(points[0])
    return MultiPolygon([Polygon(points)])


def create_reservoir_geo(reservoir):
    reservoir_geo = ReservoirGeo(
        reservoir=reservoir, geometry=get_random_multipolygon()
    )
    reservoir_geo.save()


def create_for_reservoir_date(reservoir, date):
    state = ReservoirState(
        date=date, volume=random.uniform(0, 100), reservoir=reservoir
    )
    state.save()

    rainfall = RainFall(
        date=date,
        amount=random.uniform(0, 100),
        reservoir=reservoir,
        amount_cumulative=random.uniform(0, 100),
        amount_cumulative_historical=random.uniform(0, 100),
    )
    rainfall.save()

    create_reservoir_geo(reservoir)


def fill_simple(
    num_reservoirs=NUM_RESERVOIRS, date_start=date_start, date_end=date_end
):

    for i in range(num_reservoirs):
        reservoir = Reservoir(name=f"reservoir_{i}", capacity=random.uniform(0, 100))
        reservoir.save()

        for date in pd.date_range(date_start, date_end):
            create_for_reservoir_date(reservoir, date)


def create_regions():
    areas = [
        "Central",
        "Eastern",
        "Northern",
        "Southern",
        "Western",
    ]
    for area in areas:
        mp = get_random_multipolygon()
        region = Region(name=area, geometry=mp)
        region.save()
