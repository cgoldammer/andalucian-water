from django.http import HttpResponse, JsonResponse
from django.template import loader
from .models import (
    Inquiry,
    Reservoir,
    RainFall,
    ReservoirState,
    ReservoirSerializer,
    ReservoirSerializer2,
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

log = logging.getLogger(__name__)


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
    return Response(content)


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
    reservoirs_json = ReservoirSerializer2(reservoirs, many=True)

    return Response(reservoirs_json.data)


class TimePeriod(Enum):
    DAY = "day"
    MONTH = "month"


@api_view(["GET"])
# Allow full access to public users
@authentication_classes([])
@permission_classes([])
def get_reservoir_states(request):

    num_obs = request.GET.get("num_obs", num_obs_default)
    start_date = request.GET.get("start_date", None)
    end_date = request.GET.get("end_date", None)
    is_first_of_month = request.GET.get("is_first_of_month", "false") != "false"
    reservoir_uuids = request.GET.get("reservoir_uuids", None)

    # Print all request parameters
    log.info(f"num_obs: {num_obs}")
    log.info(f"start_date: {start_date}")
    log.info(f"end_date: {end_date}")
    log.info(f"is_first_of_month: {is_first_of_month,  type(is_first_of_month)}")
    log.info(f"reservoir_uuids: {reservoir_uuids}")

    # Require start_date and end_date
    if not start_date or not end_date:
        # Create a status for malformed input
        return Response(
            {"error": "start_date and end_date are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    states = data.get_reservoir_states_data(
        num_obs, start_date, end_date, is_first_of_month, reservoir_uuids
    )

    serializer = ReservoirStateSerializer(states, many=True)
    return Response(serializer.data)


@api_view(["GET"])
# Allow full access to public users
@authentication_classes([])
@permission_classes([])
def get_rainfall(request):
    num_obs = request.GET.get("num_obs", num_obs_default)
    start_date = request.GET.get("start_date", "2023-01-01")
    end_date = request.GET.get("end_date", "2023-02-01")
    is_first_of_month = request.GET.get("is_first_of_month", "false") != "false"
    reservoir_uuids = request.GET.get("reservoir_uuids", None)

    # Return an error if is_first_of_month is true
    if is_first_of_month:
        return Response(
            {"error": "is_first_of_month is not supported"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not start_date or not end_date:
        # Create a status for malformed input
        return Response(
            {"error": "start_date and end_date are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    states = data.get_rainfall_data(num_obs, start_date, end_date, reservoir_uuids)
    serializer = RainFallSerializer(states, many=True)
    return Response(serializer.data)


@api_view(["GET"])
# Allow full access to public users
@authentication_classes([])
@permission_classes([])
def get_daily_data(request):
    print("RUNN")
    num_obs = int(request.GET.get("num_obs", num_obs_default))
    start_date = request.GET.get("start_date", "2023-01-01")
    end_date = request.GET.get("end_date", "2023-02-01")
    is_first_of_month = request.GET.get("is_first_of_month", "false") != "false"
    reservoir_uuids = request.GET.get("reservoir_uuids", None)

    log.info("reservoir_uuids: " + str(reservoir_uuids))

    # Return an error if is_first_of_month is true
    if is_first_of_month:
        return Response(
            {"error": "is_first_of_month is not supported"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not start_date or not end_date:
        # Create a status for malformed input
        return Response(
            {"error": "start_date and end_date are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not reservoir_uuids:
        return Response(
            {"error": "reservoir_uuids is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    states = data.get_daily_data(
        num_obs, start_date, end_date, is_first_of_month, reservoir_uuids
    )
    serializer = data.DailyDataSerializer(states, many=True)
    return Response(serializer.data)
