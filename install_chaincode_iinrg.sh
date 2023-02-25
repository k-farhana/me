#!/bin/bash

export PATH=$PATH:/home/vijay/Desktop/Practise/fabric/fabric-samples/bin
export FABRIC_CFG_PATH=$PWD/config

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=iinrg
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-config/peerOrganizations/iinrg.vdoservices.in/peers/peer0.iinrg.vdoservices.in/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/iinrg.vdoservices.in/users/Admin@iinrg.vdoservices.in/msp
export CORE_PEER_ADDRESS=localhost:8051

peer lifecycle chaincode install chaincode/basic.tar.gz


