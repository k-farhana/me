#!/bin/bash

# brings network down
./network.sh down

# removes the docker network
docker network prune -f

# remove all docker volumes
docker volume rm $(docker volume ls)

# start network
./network.sh createChannel -c producer-channel -s couchdb

# to deploy chaincode
./network.sh deployCC -c producer-channel -ccn fabcar -ccv 1.0 -ccp ./chaincodes/fabcar -ccl javascript -cci initLedger