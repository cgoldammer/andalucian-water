from django.http import HttpResponse, JsonResponse
from django.template import loader
from .models import (
    Reservoir,
    RainFall,
    ReservoirState,
    ReservoirSerializer,
    ReservoirSerializerExtended,
    ReservoirStateSerializer,
    RainFallSerializer,
)
from django.shortcuts import render
from . import texts
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from water.utils import helpers as h
from rest_framework.request import Request
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from rest_framework.authtoken import views
from rest_framework.authentication import (
    SessionAuthentication,
    BasicAuthentication,
    TokenAuthentication,
)
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import authentication_classes, permission_classes
import logging
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from enum import Enum
import json
from django.db.models import Count
from .utils import data
from django.http import JsonResponse
from .models import ReservoirGeo

log = logging.getLogger(__name__)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@csrf_exempt
def health(request):
    response = JsonResponse({"status": "ok"})
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@api_view(["GET"])
def test(request, text: str):
    return Response({"text": text})


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_login_test(request):
    content = {
        "user": str(request.user),  # `django.contrib.auth.User` instance.
        "auth": str(request.auth),  # None
    }
    # Return JSON
    return JsonResponse(content)


@csrf_exempt
def register_view(request):
    """
    Register a new user.
    """
    username = request.headers.get("username")
    password = request.headers.get("password")

    # Create a new user, if it does not exist already
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(username=username, password=password)
        user.save()
        token = Token.objects.create(user=user)

        response = {
            "success": True,
            "type": "register",
            "token": token.key,
            "username": username,
            "message": "User registered successfully",
        }

    else:
        response = {
            "success": False,
            "type": "register",
            "message": "User already exists",
        }
    return JsonResponse(response)


@csrf_exempt
def login_view(request):
    username = request.headers.get("username")
    password = request.headers.get("password")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Get the token
        token = Token.objects.get(user=user)
        response = {
            "success": True,
            "type": "login",
            "token": token.key,
            "message": "User logged in successfully",
        }
    else:
        response = {
            "success": False,
            "type": "login",
            "message": "User not logged in successfully",
        }
    return JsonResponse(response)


def logout_view(request):
    user = request.user
    token = Token.objects.get(user=user)
    token.delete()
    logout(request)
    return HttpResponse("Logged out")


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user(request):
    return Response({"logged_in": True, "username": request.user.username})


num_obs_default = 500


@api_view(["GET"])
# Allow full access to public users
@authentication_classes([])
@permission_classes([])
def get_reservoirs(request):
    log.warn("get_reservoirs")
    reservoirs = data.get_reservoir_data()
    log.warn(f"reservoirs: {len(reservoirs)}")
    reservoirs_json = ReservoirSerializerExtended(reservoirs, many=True)
    return Response(reservoirs_json.data)


class TimePeriod(Enum):
    DAY = "day"
    MONTH = "month"


class FilterRequest:
    def __init__(self, request):
        self.num_obs = request.GET.get("num_obs", num_obs_default)
        self.start_date = request.GET.get("start_date", None)
        self.end_date = request.GET.get("end_date", None)
        self.filter_type = request.GET.get("filter_type", "year")
        self.reservoir_uuids = request.GET.get("reservoir_uuids", "")

        self.inputs = {
            "num_obs": self.num_obs,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "filter_type": self.filter_type,
            "reservoir_uuids": self.reservoir_uuids.split(","),
        }


def createFilterRequest(handler, serializerForData, require_uuids=True):

    @api_view(["GET"])
    @authentication_classes([])
    @permission_classes([])
    def filter_request(request: Request):

        filter_request = FilterRequest(request)
        inputs = filter_request.inputs

        log.info("Inputs: " + str(inputs))

        # Require start_date and end_date
        if not inputs["start_date"] or not inputs["end_date"]:
            # Create a status for malformed input
            return Response(
                {"error": "start_date and end_date are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if require_uuids and not inputs["reservoir_uuids"]:
            return Response(
                {"error": "reservoir_uuids is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not require_uuids:
            del inputs["reservoir_uuids"]
            inputs["group_var"] = request.GET.get("group_var", None)

        print("Inputs", inputs)

        states = handler(**inputs)
        print(f"States: {len(states)}")
        print(states[0])

        serializer = serializerForData(states, many=True)
        return Response(serializer.data)

    return filter_request


get_wide = createFilterRequest(data.get_wide_data, data.StatesMaterializedSerializer)
get_wide_agg = createFilterRequest(
    data.get_wide_data_agg, data.DataAggSerializer, False
)


# Provide the file in water/data/reservoirs.json as a json endpoint
@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
def get_reservoirs_json(request):
    geojson = data.get_reservoirs_geojson()
    return JsonResponse(geojson)


# Provide the file in water/data/reservoirs.json as a json endpoint
@api_view(["GET"])
@authentication_classes([])
@permission_classes([])
def get_regions_json(request):
    geojson = data.get_regions_geojson()
    return JsonResponse(geojson)


def simple_string(request):
    return HttpResponse("Simple string")
