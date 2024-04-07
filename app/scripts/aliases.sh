#!/bin/bash
# set -e

alias setupenv="conda deactivate; source $CD_WATER/.venv/bin/activate"
alias run_frontend_local="(cd $CD_WATER/app/frontend && npm run devLocal)"
alias db="psql -U postgres"
alias certbot='ssh bizpersonal "docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --dry-run -d water.chrisgoldammer.com"'
alias run_django_prod="run_manage default prod runserver 8002"
alias run_django_dev="run_manage local dev runserver 8002"
alias run_web_dev="cd $CD_WATER/app/frontend; npm run devLocal"
alias tunnel_rds='ssh -L 5434:water.c30hvdgqsc84.us-east-1.rds.amazonaws.com:5432 ec2-user@bizpersonal -N'

run_manage() {
    local dbused=$1
    local environment=$2
    local command=$3
    shift 3

    cd $CD_WATER/app/backend
    DB_USED=$dbused DJANGO_SETTINGS_MODULE=water.settings.$environment ./manage.py $command "$@"
}