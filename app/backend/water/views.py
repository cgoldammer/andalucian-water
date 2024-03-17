from django.http import HttpResponse, JsonResponse
from django.template import loader
from .models import Inquiry,  Reservoir, RainFall, ReservoirState, ReservoirSerializer, ReservoirStateSerializer
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
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import authentication_classes, permission_classes
import logging
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

log = logging.getLogger(__name__)

@api_view(['GET'])
def test(request, text: str):
    return Response({"text": text})

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_login_test(request):
    content = {
        'user': str(request.user),  # `django.contrib.auth.User` instance.
        'auth': str(request.auth),  # None
    }
    # Return JSON
    return Response(content)

@csrf_exempt
def register_view(request):
    """
    Register a new user.
    """
    username = request.headers.get('username')
    password = request.headers.get('password')
    print((username, password))
    
    # Create a new user, if it does not exist already
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(username=username, password=password)
        user.save()
        token = Token.objects.create(user=user)
        
        response = {
            'success': True,
            'type': 'register',
            'token': token.key,
            'username': username,
            'message': "User registered successfully"
        }
        
    else:
        response = {
            'success': False,
            'type': 'register',
            'message': "User already exists"
        }
    return JsonResponse(response)

@csrf_exempt
def login_view(request):
    username = request.headers.get('username')
    password = request.headers.get('password')
    print("LOGIN")
    print((username, password))
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Get the token
        token = Token.objects.get(user=user)
        response = {
            'success': True, 
            'type': 'login',
            'token': token.key,
            'message': "User logged in successfully"
            }
    else:
        response = {
            'success': False,
            'type': 'login',
            'message': "User not logged in successfully"
        }
    return JsonResponse(response)
        
def logout_view(request):
    user = request.user
    token = Token.objects.get(user=user)
    token.delete()
    logout(request)
    return HttpResponse("Logged out")

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user(request):
    return Response({'logged_in': True, "username": request.user.username})

@api_view(['GET'])
# Allow full access to public users
@authentication_classes([])
@permission_classes([])
def get_reservoir_states(request):
    
    num_res = 200
    is_first_of_month = request.GET.get('is_first_of_month', True)
    
    if is_first_of_month:
        states = ReservoirState.objects.filter(date__day=1).order_by('reservoir__uuid', 'date')
    else:
        states = ReservoirState.objects.order_by('reservoir__uuid', 'date')
        
    # Restrict to everything after 2020
    states = states.filter(date__year__gte=2023)[0:num_res]
    serializer = ReservoirStateSerializer(states, many=True)
    return Response(serializer.data)
    