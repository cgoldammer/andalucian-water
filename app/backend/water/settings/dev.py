# SECURITY WARNING: don't run with debug turned on in production!
from pathlib import Path
import os
from .base import *

DEBUG = True

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

logging.config.dictConfig(LOGGING)

db_used = os.environ.get("DB_USED", "local")
db_password = os.environ.get("POSTGRES_PASSWORD")

database_confs = {
    "local": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "water_dev",
        "USER": "postgres",
    },
    "rdstunnel": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "water_prod",
        "HOST": "localhost",
        "USER": "postgres",
        "PORT": "5434",
        "PASSWORD": db_password,
    },
}

DATABASES = {
    "default": database_confs[db_used],
}

SECRET_KEY = os.environ.get("SECRET_KEY")
