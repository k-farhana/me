#!/bin/bash

# brings network down
./network.sh down

# removes the docker network
docker network prune -f

# remove all docker volumes
docker volume rm $(docker volume ls)

# start network
./network.sh createChannel -c producer-channel -s couchdb

# lac sample test application
./network.sh deployCC -c producer-channel -ccn lacsampletestapplication -ccv 1.0 -ccp ./chaincodes/lac-sample-test-application -ccl javascript

# auction
./network.sh deployCC -c producer-channel -ccn auction -ccv 1.0 -ccp ./chaincodes/auction -ccl javascript

# loan
./network.sh deployCC -c producer-channel -ccn loan -ccv 1.0 -ccp ./chaincodes/loan -ccl javascript