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

ArrayField = postgres_fields.ArrayField

class UuidModel(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True

class Inquiry(UuidModel):
    email = models.EmailField()
    message = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.email
 
class Reservoir(UuidModel):
    name = models.CharField(max_length=100)
    capacity = models.FloatField()
    
    constraints = [
            models.UniqueConstraint(
                fields=["name"], name="unique_reservoir"
            )
        ]
   
class RainFall(UuidModel):
    date = models.DateTimeField()
    amount = models.FloatField()
    reservoir = models.ForeignKey(Reservoir, on_delete=models.CASCADE, related_name='reservoir_rainfall') 
 
class ReservoirState(UuidModel):
    date = models.DateField()
    volume = models.FloatField()
    reservoir = models.ForeignKey(Reservoir, on_delete=models.CASCADE, related_name='reservoir_reservoirstate')
    
    constraints = [
            models.UniqueConstraint(
                fields=["date", "reservoir"], name="unique_reservoir_state"
            )
        ]

class ReservoirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservoir
        fields = ['uuid', 'name', 'capacity']
        
class ReservoirStateSerializer(serializers.ModelSerializer):
    reservoir = ReservoirSerializer()

    class Meta:
        model = ReservoirState
        fields = ['uuid', 'date', 'volume', 'reservoir']