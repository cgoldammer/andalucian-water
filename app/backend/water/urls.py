from django.contrib import admin
from django.urls import path
from . import views
from django.conf.urls import include
from rest_framework.authtoken import views as authViews

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/test/<str:text>/", views.test, name="test"),
    path("api/login_test/", views.get_login_test, name="get_login_test"),
    path("api/api-token-auth/", authViews.obtain_auth_token),
    path("api/register/", views.register_view, name="register"),
    path("api/login/", views.login_view, name="login"),
    path(
        "api/get_reservoir_states/",
        views.get_reservoir_states,
        name="get_reservoir_states",
    ),
    path("api/get_rainfall/", views.get_rainfall, name="get_rainfall"),
    path("api/get_reservoirs", views.get_reservoirs, name="get_reservoirs"),
    path("api/get_daily_data/", views.get_daily_data, name="get_daily_data"),
]
