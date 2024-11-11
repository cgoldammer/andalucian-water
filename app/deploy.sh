#!/bin/bash
set -e

# store the starting folder
STARTING_FOLDER=$(pwd)

cd $CD_WATER/app

echo "Testing backend"
cd backend
DB_USED=local DJANGO_SETTINGS_MODULE=water.settings.dev python manage.py test water
cd ..
echo "Backend test passed"

cd frontend
npm run buildProd
cd ..

echo "Starting deploy"
ssh water 'sudo rm -rf ~/code/; mkdir -p ~/code/'
ssh water 'sudo rm -rf ~/code/temp; mkdir -p ~/code/temp'
echo "starting sync"
rsync --exclude-from=.rsyncignore -r . water:~/code

# A hack to rename the prod file so that the URL is correct on the server.
ssh water 'mv code/frontend/serve_content/prod/bundle_prod.min.js code/frontend/serve_content/prod/bundle.min.js'
ssh water 'cd code; docker-compose build'
ssh water 'cd code; docker-compose up --no-start'

if [[ "$1" == "-up" ]]; then
    ssh water 'cd code; docker-compose up'
fi

echo "Deploy completed"

cd $STARTING_FOLDER
