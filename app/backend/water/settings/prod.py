from .base import *
import os

DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "water_prod",
        "HOST": "postgres",
        "USER": "postgres",
        "PORT": "5432",
    }
}

print(DATABASES)

ALLOWED_HOSTS = ["*"]
SECRET_KEY = os.environ.get("SECRET_KEY")
# Assert that secret key is set
assert SECRET_KEY, "SECRET_KEY is not set"

SECRET_KEY = os.environ.get("SECRET_KEY")

# Assert that secret key is set
assert SECRET_KEY, "SECRET_KEY is not set"
