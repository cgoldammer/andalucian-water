setup_env() {
    conda deactivate; 
    source $CD_WATER/.venv/bin/activate
}

run_manage() {
    local dbused=$1
    local environment=$2
    local command=$3
    shift 3    

    cd $CD_WATER/app/backend
    echo $PWD
    cd $CD_WATER/app/backend; DB_USED=$dbused DJANGO_SETTINGS_MODULE=water.settings.$environment ./manage.py $command "$@"
}