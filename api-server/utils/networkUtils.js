/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets, Gateway } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, enrollAdmin, registerAndEnrollUser } = require('./caUtil');
const { CustomError, HandleResponseError } = require('./handleResponseError');
const { MSP_ORGINFO_MAP, CHANNEL_NAME } = require('../configs/constants');
const { buildWallet } = require('./appUtil');


exports.enrollUser = async function (userId, mspId) {
	if (!userId) throw new CustomError({ m: 'UserId is required to enroll user' })
	if (!mspId) throw new CustomError({ m: 'MspId is required to enroll an user' })

	const orgInfo = MSP_ORGINFO_MAP[mspId]

	if (!orgInfo) throw new CustomError({ m: `OrgInfo not found for the msp: ${mspId}` })

	console.log('\n--> Enrolling the User : ', userId);

	const ccp = orgInfo.buildCCPOrg()
	// console.log(ccp);
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
		let { mspId, userId } = req.session

		const orgInfo = MSP_ORGINFO_MAP[mspId]

		if (!orgInfo) throw new CustomError({ m: `OrgInfo not found for the msp: ${mspId}` })

		const ccp = orgInfo.buildCCPOrg()

		const walletPath = path.resolve(__dirname, '..', 'wallet', orgInfo.orgName)

		const wallet = await buildWallet(Wallets, walletPath);

		req.session['wallet'] = wallet
		req.session['ccp'] = ccp

		const gateway = new Gateway()

		await gateway.connect(ccp, { wallet: wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } })

		let network = await gateway.getNetwork(CHANNEL_NAME)
		req.session['network'] = network

		next()
	} catch (err) {
		HandleResponseError(err, res)
	}
}