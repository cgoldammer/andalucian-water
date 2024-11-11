setup_env() {
    source $CD_WATER/.venv/bin/activate
}

run_manage() {
    local dbused=$1
    local environment=$2
    local command=$3
    shift 3

    cd $CD_WATER/app/backend
    echo $PWD
    DB_USED=$dbused DJANGO_SETTINGS_MODULE=water.settings.$environment ./manage.py $command "$@"
}


alias run_frontend_local="(cd $CD_WATER/app/frontend && npm run devLocal)"
alias run_frontend_test="(cd $CD_WATER/app/frontend && npm run test)"
alias update_alias="source $CD_WATER/app/scripts/aliases.sh"
alias db_dev="psql -U postgres -d water_dev"

# Note: The password is stored in "$HOME/.pgpass"
alias db_prod="PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -p 5434 -U postgres -d water_prod"

alias certbot='ssh bizpersonal "docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --dry-run -d water.chrisgoldammer.com"'

alias tunnel_rds='ssh -L 5434:water.c30hvdgqsc84.us-east-1.rds.amazonaws.com:5432 ec2-user@water -N -o ServerAliveInterval=60'

alias run_django_dev="setup_env; run_manage local dev runserver 8000"
alias run_django_setup_dev="setup_env; run_manage local dev setup_data"
alias run_django_setup_rds="setup_env; run_manage rdstunnel dev setup_data --env prod"
alias run_django_test="setup_env; run_manage local dev test water"