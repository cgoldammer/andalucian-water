#!/bin/bash
set -e

# store the starting folder
STARTING_FOLDER=$(pwd)

cd $CD_WATER/app

cd frontend
npm run buildProd
cd ..

echo "Starting deploy"
ssh bizpersonal 'sudo rm -rf ~/code/; mkdir -p ~/code/'
ssh bizpersonal 'sudo rm -rf ~/code/temp; mkdir -p ~/code/temp'
echo "starting sync"
rsync --exclude-from=.rsyncignore -r . bizpersonal:~/code

# A hack to rename the prod file so that the URL is correct on the server.
ssh bizpersonal 'mv code/frontend/serve_content/prod/bundle_prod.min.js code/frontend/serve_content/prod/bundle.min.js'
ssh bizpersonal 'cd code; docker-compose build'
ssh bizpersonal 'cd code; docker-compose up --no-start'

if [[ "$1" == "-up" ]]; then
    ssh bizpersonal 'cd code; docker-compose up'
fi

echo "Deploy completed"

cd $STARTING_FOLDER
