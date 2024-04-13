from django.db import models
from django.contrib.postgres import fields as postgres_fields
import numpy as np
from rest_framework import routers, serializers, viewsets
import uuid
import shapely

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from django.contrib.gis.db import models as gis_models

ArrayField = postgres_fields.ArrayField


class UuidModel(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class Reservoir(UuidModel):
    name = models.CharField(max_length=100)
    capacity = models.FloatField(null=False)
    name_full = models.CharField(max_length=100, null=True)
    province = models.CharField(max_length=100, null=True)
    constraints = [
        models.UniqueConstraint(
            fields=[
                "name",
            ],
            name="unique_reservoir",
        )
    ]


class RainFall(UuidModel):
    date = models.DateField()
    amount = models.FloatField()
    amount_cumulative = models.FloatField()
    amount_cumulative_historical = models.FloatField()
    reservoir = models.ForeignKey(
        Reservoir, on_delete=models.CASCADE, related_name="reservoir_rainfall"
    )


class ReservoirState(UuidModel):
    date = models.DateField()
    volume = models.FloatField()
    reservoir = models.ForeignKey(
        Reservoir, on_delete=models.CASCADE, related_name="reservoir_reservoirstate"
    )

    constraints = [
        models.UniqueConstraint(
            fields=["date", "reservoir"], name="unique_reservoir_state"
        )
    ]


class ReservoirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservoir
        fields = ["uuid", "name", "name_full", "province", "capacity"]


class ReservoirSerializer2(serializers.ModelSerializer):
    num_states = serializers.IntegerField()
    volume_latest = serializers.FloatField()

    class Meta:
        model = Reservoir
        fields = [
            "uuid",
            "name",
            "name_full",
            "province",
            "capacity",
            "num_states",
            "volume_latest",
        ]


class ReservoirStateSerializer(serializers.ModelSerializer):
    reservoir = ReservoirSerializer()

    class Meta:
        model = ReservoirState
        fields = ["uuid", "date", "volume", "reservoir"]


class ReservoirQuery(UuidModel):
    name = models.CharField(max_length=100)
    capacity = models.FloatField(null=False)


class RainFallSerializer(serializers.ModelSerializer):
    reservoir = ReservoirSerializer()

    class Meta:
        model = RainFall
        fields = [
            "uuid",
            "date",
            "amount",
            "amount_cumulative",
            "amount_cumulative_historical",
            "reservoir",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if np.isnan(data["amount"]):
            data["amount"] = -1
        return data


class Region(gis_models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    geometry = gis_models.MultiPolygonField()
    constraints = [models.UniqueConstraint(fields=["name"], name="unique_region_name")]


class ReservoirGeo(gis_models.Model):

    reservoir = models.ForeignKey(
        Reservoir, on_delete=models.CASCADE, related_name="reservoir_geo_reservoir"
    )
    geometry = gis_models.MultiPolygonField()
