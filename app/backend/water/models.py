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
    location = ArrayField(models.FloatField())
    capacity = models.FloatField()
   
class RainFall(UuidModel):
    date = models.DateTimeField()
    amount = models.FloatField()
    reservoir = models.ForeignKey(Reservoir, on_delete=models.CASCADE, related_name='rainfalls') 
 
class ReservoirState(UuidModel):
    date = models.DateTimeField()
    current_volume = models.FloatField()
    reservoir = models.ForeignKey(Reservoir, on_delete=models.CASCADE, related_name='states')

class ReservoirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservoir
        fields = ['name', 'location', 'capacity']
        
class ReservoirStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservoirState
        fields = ['date', 'current_volume', 'reservoir']