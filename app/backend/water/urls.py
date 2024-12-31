from django.contrib import admin
from django.urls import path
from . import views
from django.conf.urls import include
from rest_framework.authtoken import views as authViews


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/test/<str:text>/", views.test, name="test"),
    path("api/login_test", views.get_login_test, name="get_login_test"),
    path("api/api-token-auth", authViews.obtain_auth_token),
    path("api/register", views.register_view, name="register"),
    path("api/login", views.login_view, name="login"),
    path("api/get_reservoirs", views.get_reservoirs, name="get_reservoirs"),
    path("api/get_wide/", views.get_wide, name="get_wide"),
    path("api/get_wide_agg/", views.get_wide_agg, name="get_wide_agg"),
    path(
        "api/get_reservoirs_geojson",
        views.get_reservoirs_json,
        name="get_reservoirs_geojson",
    ),
    path("api/get_regions_geojson", views.get_regions_json, name="get_regions_geojson"),
    path("api/simple", views.simple_string, name="simple_string"),
    path("api/health", views.health, name="health"),
]
