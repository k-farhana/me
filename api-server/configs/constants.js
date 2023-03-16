const { buildCCPOrg1, buildCCPOrg2 } = require('../utils/appUtil');

exports.MSP_ORGINFO_MAP = {
	'Org1MSP': { caHost: 'ca.org1.example.com', orgName: 'org1', buildCCPOrg: buildCCPOrg1 },
	'Org2MSP': { caHost: 'ca.org2.example.com', orgName: 'org2', buildCCPOrg: buildCCPOrg2 }
}

exports.CHANNEL_NAME = "producer-channel"

exports.CHAINCODE_NAME = {
	FABCAR: 'fabcar'
}