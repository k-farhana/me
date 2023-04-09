const mongoose = require('mongoose')
const { USER_TYPE } = require('../configs/constants')
const UserModel = require('../models/user-model')
const { HandleResponseError, RequestInputError } = require('../utils/handleResponseError')
const { enrollUser } = require('../utils/networkUtils')

const router = require('express').Router()

const MSP_ID = 'Org1MSP'

// create farmer user
router.post('/farmer', async (req, res) => {
    try {
        await createUser('farmer', MSP_ID, req.body)

        res.status(201).json({ data: 'successfully created' })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// create fpo user
router.post('/fpo', async (req, res) => {
    try {
        await createUser(USER_TYPE.FPO, MSP_ID, req.body)

        res.status(201).json({ data: 'successfully created' })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// get fpo list for farmer signup
router.get('/fpo', async (req, res) => {
    try{
        let data = await UserModel.find({ type: USER_TYPE.FPO }).select({ _id: 1, userName: 1, name: 1 })

        res.status(200).json({ data })
    }catch(err) {
        HandleResponseError(err, res)
    }
})

// create nisa user
router.post('/nisa', async (req, res) => {
    try {
        await createUser(USER_TYPE.NISA, MSP_ID, req.body)

        res.status(201).json({ data: 'successfully created' })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// create samunnati user
router.post('/samunnati', async (req, res) => {
    try {
        await createUser(USER_TYPE.LENDING_PARTNER, MSP_ID, req.body)

        res.status(201).json({ data: 'successfully created' })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// create corporateclient user
router.post('/corporateclient', async (req, res) => {
    try {
        await createUser(USER_TYPE.CORPORATE_CLIENT, MSP_ID, req.body)

        res.status(201).json({ data: 'successfully created' })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

async function createUser(type, mspId, body) {
    let { fpoId } = body

    if(type == "farmer" && (!fpoId || fpoId == "")) {
        throw new RequestInputError({ message: 'fpoId is required to create farmer user' })
    }

    let id = new mongoose.Types.ObjectId()
    let obj = { _id: id, mspId, type, ...body }

    let user = await UserModel.find({ userName: obj.userName })

    if(user.length > 0) {
        throw new RequestInputError({ message: 'User with given username already exists' })
    }

    let result = await UserModel.create(obj)

    // create wallet for the user
    await enrollUser(id, mspId)
}

module.exports = router