from water import models as m
import random
import pandas as pd
from django.contrib.gis.geos import Polygon, LinearRing, MultiPolygon
from water.utils import helpers
from django.db import connections
from water.utils import sql
from water.utils import data
from django.db.models import Min, Max

db_conn = connections["default"]

NUM_RESERVOIRS = 2

start_date = "2023-01-01"
end_date = "2023-01-05"

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
    reservoir_geo = m.ReservoirGeo(
        reservoir=reservoir, geometry=get_random_multipolygon()
    )
    reservoir_geo.save()


def create_for_reservoir_date(reservoir, date):
    state = m.ReservoirState(
        date=date, volume=random.uniform(0, 100), reservoir=reservoir
    )
    state.save()

    rainfall = m.RainFall(
        date=date,
        amount=random.uniform(0, 100),
        reservoir=reservoir,
        amount_cumulative=random.uniform(0, 100),
        amount_cumulative_historical=random.uniform(0, 100),
    )
    rainfall.save()

    create_reservoir_geo(reservoir)


def fill_simple(
    num_reservoirs=NUM_RESERVOIRS, start_date=start_date, end_date=end_date
):

    region = m.Region(name="Spain", geometry=get_random_multipolygon())
    region.save()

    for i in range(num_reservoirs):
        reservoir = m.Reservoir(
            name=f"reservoir_{i}", capacity=random.uniform(0, 100), region=region
        )
        reservoir.save()

        for date in pd.date_range(start_date, end_date):
            create_for_reservoir_date(reservoir, date)

    cursor = db_conn.cursor()
    cursor.execute(sql.q_createview)
    assert data.StatesMaterialized.objects.all().count() > 0

    date_range_materialized = m.ReservoirState.objects.aggregate(
        min_date=Min("date"), max_date=Max("date")
    )

    assert date_range_materialized["min_date"] == pd.Timestamp(start_date).date()
    assert date_range_materialized["max_date"] == pd.Timestamp(end_date).date()


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
        region = m.Region(name=area, geometry=mp)
        region.save()
