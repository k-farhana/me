#!/bin/bash

set e

echo "Starting FPO-1 organisation..."
export PATH=$PATH:/home/vijay/Desktop/Practise/fabric/fabric-samples/bin
export FABRIC_CFG_PATH=$PWD/config

echo FABRIC_CFG_PATH=$FABRIC_CFG_PATH

pwd

echo "Spinning up the container"
docker-compose -f fpo1-docker-compose.yaml up -d

echo "waiting 2 sec to join orderer to channel"
sleep 2

echo "joining orderer to channel"
osnadmin channel join \
    --channelID producer-channel \
    --config-block channel-artifacts/producer_genesis_block.pb \
    -o localhost:7081 \
    --ca-file ./crypto-config/ordererOrganizations/vdoservices.in/orderers/orderer.fpo1.vdoservices.in/tls/ca.crt \
    --client-cert ./crypto-config/ordererOrganizations/vdoservices.in/users/Admin@vdoservices.in/tls/client.crt \
    --client-key ./crypto-config/ordererOrganizations/vdoservices.in/users/Admin@vdoservices.in/tls/client.key

echo "verifying that orderer joined the channel"
osnadmin channel list \
    -o localhost:7081 \
    --ca-file ./crypto-config/ordererOrganizations/vdoservices.in/orderers/orderer.fpo1.vdoservices.in/tls/ca.crt \
    --client-cert ./crypto-config/ordererOrganizations/vdoservices.in/users/Admin@vdoservices.in/tls/client.crt \
    --client-key ./crypto-config/ordererOrganizations/vdoservices.in/users/Admin@vdoservices.in/tls/client.key

sleep 1

echo "joining peer0.fpo1.vdoservices.in into producer-channel"
docker exec -it peer0.fpo1.vdoservices.in peer channel join -b producer_genesis_block.pb

sleep .5

echo "verifying peer0.fpo1.vdoservices.in channel"
docker exec -it peer0.fpo1.vdoservices.in peer channel list

sleep 1

echo "joining peer1.fpo1.vdoservices.in into producer-channel"
docker exec -it peer1.fpo1.vdoservices.in peer channel join -b producer_genesis_block.pb

sleep .5

echo "verifying peer1.fpo1.vdoservices.in channel"
docker exec -it peer1.fpo1.vdoservices.in peer channel list