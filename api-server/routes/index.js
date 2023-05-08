'use strict';

const router = require('express').Router()
const jwt = require('jsonwebtoken')

const { CHAINCODE_NAME, JWT_SECRET, USER_TYPES } = require('../configs/constants');
const UserModel = require('../models/user-model');
const auth = require('../utils/auth-middleware');
const { UploadToDisk } = require('../utils/fileUpload');
const { HandleResponseError, RequestInputError } = require('../utils/handleResponseError');
const { getNetworkInfo, enrollUser } = require('../utils/networkUtils');

router.use('/nisa', auth, require('./nisa'))
router.use('/fpo', auth, require('./fpo-products'))
router.use('/farmer', auth, require('./farmer'))
router.use('/auction', auth, require('./auction'))
router.use('/loanwindow', auth, require('./loan'))
router.use('/support', auth, require('./support'))
router.use('/signup', require('./signup'))

router.post('/document', UploadToDisk.single('doc'), async (req, res) => {
    try {
        let { generatedName } = req.file
        res.status(201).json({ data: { docId: generatedName } })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.post('/login', async (req, res) => {
    try{
        let { userName, password } = req.body


        let user = await UserModel.find({ userName, password }).select({ password: 0 })

        if(user.length == 0) {
            throw new RequestInputError({ message: 'Invalid username or password' })
        }

        console.log(user);

        let { _id, mspId, type } = user[0]

        let jwtPayload = { userId: _id, mspId, fpoId: type == 'fpo' ? _id : "" }

        let token = jwt.sign(jwtPayload, JWT_SECRET)

        res.status(200).json({ data: user[0], token })

    }catch(err){
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

router.get('/user/id/:userId', async (req, res) => {
    try{
        let { userId } = req.params

        let data = await UserModel.find({ _id: userId }).select({ password: 0 })
        res.status(200).json({ data })
    }catch(err){
        HandleResponseError(err, res)
    }
})

// get user list for iit-dhanbad
router.get('/user/list/:type', async (req, res) => {
    try{
        let { type } = req.params
        console.log("type here" , type);

        if(!USER_TYPES.includes(type)) {
            throw new RequestInputError({ message: 'Invalid user type' })
        }
        let data = await UserModel.find({ type }).select({ password: 0 })

        res.status(200).json({ data })
    }catch(err) {
        HandleResponseError(err, res)
    }
})

router.get('/fabcar', auth, getNetworkInfo, async (req, res) => {
    try {
        let { mspId, userId, wallet, ccp, network } = req.session

        // const gateway = new Gateway()

        // await gateway.connect(ccp, { wallet: wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        // const network = await gateway.getNetwork(CHANNEL_NAME);
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
        let { mspId, userId, wallet, ccp, network } = req.session

        // const gateway = new Gateway()

        // await gateway.connect(ccp, { wallet: wallet, identity: userId, discovery: { enabled: true, asLocalhost: true } });

        // const network = await gateway.getNetwork(CHANNEL_NAME);
        const contract = network.getContract(CHAINCODE_NAME.FABCAR);

        // let fabcarString = await contract.submitTransaction('createCar', 'car06', 'BMW', 'GT1200', 'Matt Black', 69);
        let fabcarString = await contract.submitTransaction('createCarFromObj', 'OBJ01', JSON.stringify({ 'name': "BMW" }));
        let data = fabcarString.toString()
        // let data = JSON.parse(fabcarString.toString())

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

module.exports = router
