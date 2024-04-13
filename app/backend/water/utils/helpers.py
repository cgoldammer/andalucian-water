from django.contrib.gis.geos import Polygon, LinearRing, MultiPolygon
from shapely.geometry import (
    Polygon as ShapelyPolygon,
    MultiPolygon as ShapelyMultiPolygon,
)


def to_django_polygon(shapely_polygon, multi=False):
    exterior_ring = LinearRing(list(shapely_polygon.exterior.coords))
    interior_rings = [
        LinearRing(list(interior.coords)) for interior in shapely_polygon.interiors
    ]
    poly = Polygon(exterior_ring, interior_rings)

    if multi:
        return MultiPolygon([poly])
    else:
        return poly


def to_django_multipolygon(shapely_multipolygon):
    polygons = [
        to_django_polygon(shapely_polygon)
        for shapely_polygon in shapely_multipolygon.geoms
    ]
    return MultiPolygon(polygons)


def to_django_multipolygon_any(shapely_polygon):
    if isinstance(shapely_polygon, ShapelyPolygon):
        return to_django_polygon(shapely_polygon, multi=True)
    else:
        return to_django_multipolygon(shapely_polygon)
