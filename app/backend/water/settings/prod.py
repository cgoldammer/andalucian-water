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


LOGGING = {
    "version": 1,
    "filters": {
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "filters": ["require_debug_true"],
            "class": "logging.StreamHandler",
        },
        "file_sql": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "logs", "log_sql.txt"),
        },
        "file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "logs", "log.txt"),
        },
    },
    "loggers": {
        "django.db.backends": {
            "level": "DEBUG",
            "handlers": ["file_sql"],
        },
        "water": {  # This is the root logger configuration
            "handlers": ["console", "file"],
            "level": "DEBUG",
        },
        "django.request": {
            "handlers": ["console", "file"],  # Adjust as necessary
            "level": "DEBUG",  # Capture all debug and above messages
            "propagate": True,
        },
    },
}

# Add the LOGGING configuration to every module in the "water" package
import logging.config

ALLOWED_HOSTS = ["*"]
SECRET_KEY = os.environ.get("SECRET_KEY")
# Assert that secret key is set
assert SECRET_KEY, "SECRET_KEY is not set"

SECRET_KEY = os.environ.get("SECRET_KEY")

# Assert that secret key is set
assert SECRET_KEY, "SECRET_KEY is not set"
