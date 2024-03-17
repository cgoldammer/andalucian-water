"""
URL configuration for water project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from water import views
from django.conf.urls import include
from rest_framework.authtoken import views as authViews

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/<str:text>', views.test, name='test'),
    path('api/login_test', views.get_login_test, name='get_login_test'),
    path('api/api-token-auth/', authViews.obtain_auth_token),
    path('api/register', views.register_view, name='register'),
    path('api/login', views.login_view, name='login'),
    path('api/get_reservoir_states', views.get_reservoir_states, name='get_reservoir_states'),
]
