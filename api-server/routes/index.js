'use strict';

const router = require('express').Router()
const { Gateway, Wallets } = require('fabric-network');
const { CHANNEL_NAME, CHAINCODE_NAME } = require('../configs/constants');

const auth = require('../utils/auth-middleware');
const { UploadToDisk } = require('../utils/fileUpload');
const { HandleResponseError } = require('../utils/handleResponseError');
const { getNetworkInfo, enrollUser } = require('../utils/networkUtils');

router.use('/nisa', auth, require('./nisa'))
router.use('/fpo', auth, require('./fpo-products'))

router.post('/document', UploadToDisk.single('doc'), async (req, res) => {
    try {
        let { generatedName } = req.file
        res.status(201).json({ data: { docId: generatedName } })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.post('/user', async (req, res) => {
    try {
        let { userId, mspId } = req.body
        await enrollUser(userId, mspId)

        res.status(201).json({ data: "User created" })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.get('/fabcar', auth, getNetworkInfo, async (req, res) => {
    try {
        let { mspId, userId, wallet, ccp } = req.session

        const gateway = new Gateway()

        await gateway.connect(ccp, { wallet: wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork(CHANNEL_NAME);
        const contract = network.getContract(CHAINCODE_NAME.FABCAR);

        let fabcarString = await contract.evaluateTransaction('queryAllCars');
        let data = JSON.parse(fabcarString)

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.post('/fabcar', auth, getNetworkInfo, async (req, res) => {
    try {
        let { mspId, userId, wallet, ccp } = req.session

        const gateway = new Gateway()

        await gateway.connect(ccp, { wallet: wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork(CHANNEL_NAME);
        const contract = network.getContract(CHAINCODE_NAME.FABCAR);

        let fabcarString = await contract.submitTransaction('createCar', 'car05', 'BMW', 'GT1200', 'Matt Black', 'Vj');
        // let fabcarString = await contract.submitTransaction('createCarFromObj', 'car04', JSON.stringify({ 'name': "BMW" }));
        let data = fabcarString.toString()
        // let data = JSON.parse(fabcarString.toString())

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

module.exports = router