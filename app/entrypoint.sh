#!/bin/bash
# Wait for database to be ready (pseudo-code, adjust as needed)
# Example: wait-for-it.sh db:5432 --timeout=0

# Apply Django migrations and any other setup commands
# DJANGO_SETTINGS_MODULE=water.settings.prod python manage.py makemigrations water
# DJANGO_SETTINGS_MODULE=water.settings.prod python manage.py migrate
# DJANGO_SETTINGS_MODULE=water.settings.prod python manage.py setup_data --env prod --num 5000
DJANGO_SETTINGS_MODULE=water.settings.prod python manage.py runserver 0.0.0.0:8002