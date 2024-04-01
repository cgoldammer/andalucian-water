#!/bin/bash
set -e

alias setupenv="conda deactivate; source $CD_WATER/env/bin/activate"
alias run_frontend_local="(cd $CD_WATER/app/frontend && npm run devLocal)"
alias db="psql -U postgres"
alias certbot='ssh bizpersonal "docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --dry-run -d water.chrisgoldammer.com"'
alias run_django_prod="cd $CD_WATER/app/backend; DJANGO_SETTINGS_MODULE=water.settings.prod ./manage.py runserver 8002"
alias run_django_dev="cd $CD_WATER/app/backend; DJANGO_SETTINGS_MODULE=water.settings.dev ./manage.py runserver 8000"