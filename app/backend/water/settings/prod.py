from .base import *
import os

DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "water_prod",
        "HOST": "water.c30hvdgqsc84.us-east-1.rds.amazonaws.com",
        "USER": "postgres",
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD"),
        "PORT": "5432",
    }
}

ALLOWED_HOSTS = ["*"]
SECRET_KEY = os.environ.get("SECRET_KEY")
# Assert that secret key is set
assert SECRET_KEY, "SECRET_KEY is not set"

SECRET_KEY = os.environ.get("SECRET_KEY")

# Assert that secret key is set
assert SECRET_KEY, "SECRET_KEY is not set"
