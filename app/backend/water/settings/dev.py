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
            "level": "INFO",
            "filters": ["require_debug_true"],
            "class": "logging.StreamHandler",
        },
        "file_sql": {
            "level": "WARNING",
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "logs", "log_sql.txt"),
        },
        "file": {
            "level": "WARNING",
            "class": "logging.FileHandler",
            "filename": os.path.join(BASE_DIR, "logs", "log.txt"),
        },
    },
    "loggers": {
        "django.db.backends": {
            "level": "DEBUG",
            "handlers": ["file_sql"],
        },
        "water.views": {  # This is the root logger configuration
            "handlers": ["console", "file"],
            "level": "INFO",
        },
    },
}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "water_dev",
        "USER": "postgres",
    }
}

SECRET_KEY = "django-insecure-50q41reeg!gh!8#=6o1v=j0tv91!dy0b*5o6%a*9_*87g5f79@"
