/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, enrollAdmin, registerAndEnrollUser } = require('./caUtil');
const { CustomError, HandleResponseError } = require('./handleResponseError');
const { MSP_ORGINFO_MAP } = require('../configs/constants');
const { buildWallet } = require('./appUtil');


exports.enrollUser = async function (userId, mspId) {
	if (!userId) throw new CustomError({ m: 'UserId is required to enroll user' })
	if (!mspId) throw new CustomError({ m: 'MspId is required to enroll an user' })

	const orgInfo = MSP_ORGINFO_MAP[mspId]

	if (!orgInfo) throw new CustomError({ m: `OrgInfo not found for the msp: ${mspId}` })

	console.log('\n--> Enrolling the User : ', userId);

	const ccp = orgInfo.buildCCPOrg()
	console.log(ccp);
	const caClient = buildCAClient(FabricCAServices, ccp, orgInfo.caHost)

	const walletPath = path.resolve(__dirname, '..', 'wallet', orgInfo.orgName)
	const wallet = await buildWallet(Wallets, walletPath)

	console.log({ walletPath });

	// admin will be enrolled only once per organisation
	// those conditions are handled in enrollAdmin function
	await enrollAdmin(caClient, wallet, mspId)

	// enrolling the user
	await registerAndEnrollUser(caClient, wallet, mspId, userId, orgInfo.orgName + ".department1")
}

exports.getNetworkInfo = async function (req, res, next) {
	try {
		let { mspId } = req.session
		
		const orgInfo = MSP_ORGINFO_MAP[mspId]

		if (!orgInfo) throw new CustomError({ m: `OrgInfo not found for the msp: ${mspId}` })

		const ccp = orgInfo.buildCCPOrg()
		
		const walletPath = path.resolve(__dirname, '..', 'wallet', orgInfo.orgName)
		
		const wallet = await buildWallet(Wallets, walletPath);

		req.session['wallet'] = wallet
		req.session['ccp'] = ccp

		next()
	} catch (err) {
		HandleResponseError(err, res)
	}
}

// exports.connectToOrg1CA = async function () {
// 	console.log('\n--> Enrolling the Org1 CA admin');
// 	const ccpOrg1 = buildCCPOrg1();
// 	const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca.org1.example.com');

// 	const walletPathOrg1 = path.join(__dirname, 'wallet/org1');
// 	const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

// 	await enrollAdmin(caOrg1Client, walletOrg1, mspOrg1);

// }

// exports.connectToOrg2CA = async function () {
// 	console.log('\n--> Enrolling the Org2 CA admin');
// 	const ccpOrg2 = buildCCPOrg2();
// 	const caOrg2Client = buildCAClient(FabricCAServices, ccpOrg2, 'ca.org2.example.com');

// 	const walletPathOrg2 = path.join(__dirname, 'wallet/org2');
// 	const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);

// 	await enrollAdmin(caOrg2Client, walletOrg2, mspOrg2);

// }