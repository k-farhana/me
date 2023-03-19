const router = require('express').Router()
const { v4: uuid } = require('uuid');
const moment = require('moment')

const CropAdvisoryModel = require('../models/crop-advisory-model')
const TraningModel = require('../models/traning-model')
const LacTestModel = require('../models/lac-test-model')

const { HandleResponseError } = require('../utils/handleResponseError')
const auth = require('../utils/auth-middleware')
const { getNetworkInfo } = require('../utils/networkUtils')
const { CHAINCODE_NAME, LAC_TEST_APPLICATION_STATUS, CHANNEL_NAME } = require('../configs/constants')

router.get('/crop-advisory', async (req, res) => {
    try {
        let data = await CropAdvisoryModel.find().sort({ createdAt: -1 })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.post('/crop-advisory', async (req, res) => {
    try {
        let { cropAdvisoryId, title, content } = req.body

        let resposne = await CropAdvisoryModel.create({ cropAdvisoryId, title, content })

        res.status(201).json({ data: resposne })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.put('/crop-advisory/:id', async (req, res) => {
    try {
        let { id } = req.params
        let { title, content } = req.body

        let data = await CropAdvisoryModel.updateOne({ _id: id }, { title, content })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.get('/traning', async (req, res) => {
    try {
        let data = await TraningModel.find().sort({ createdAt: -1 })
        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.post('/traning', async (req, res) => {
    try {
        let { traningId, courseName, courseStartDate, duration, applicationStartDate, applicationEndDate, fee, remarks } = req.body

        let data = await TraningModel.create({ traningId, courseName, courseStartDate, duration, applicationStartDate, applicationEndDate, fee, remarks })

        res.status(201).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.put('/traning/:id', async (req, res) => {
    try {
        let { id } = req.params
        let { traningId, courseName, courseStartDate, duration, applicationStartDate, applicationEndDate, fee, remarks } = req.body

        let data = await TraningModel.updateOne({ _id: id }, { traningId, courseName, courseStartDate, duration, applicationStartDate, applicationEndDate, fee, remarks })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// api to add new test type for nisa
router.post('/lac-test', async (req, res) => {
    try {
        let { testId, category, testName, minRequiredQuantity, testFee, reportingPeriod } = req.body

        let data = await LacTestModel.create({ testId, category, testName, minRequiredQuantity, testFee, reportingPeriod })

        res.status(201).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.get('/lac-test', async (req, res) => {
    try {
        let data = await LacTestModel.find({})

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// lac test submitted by fpo 
router.post('/lactest', getNetworkInfo, async (req, res) => {
    try {
        let { fpoId, userId, network } = req.session

        const contract = network.getContract(CHAINCODE_NAME.LAC_SAMPLE_TEST_APPLICATION)

        let id = uuid()
        let additionalFields = {
            fpoId,
            referenceNo: "",
            certificate: "",
            applicationStatus: LAC_TEST_APPLICATION_STATUS.IN_PROCESS,
            createdAt: moment().format(),
            createdBy: userId
        }
        let lacSampleTest = { ...req.body, ...additionalFields }
        let result = await contract.submitTransaction('create', id, JSON.stringify(lacSampleTest))

        res.status(201).json({ data: result.toString() })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// get list of lac test application
router.get('/lactest', getNetworkInfo, async (req, res) => {
    try {
        let { fpoId, userId, network } = req.session

        const contract = network.getContract(CHAINCODE_NAME.LAC_SAMPLE_TEST_APPLICATION)

        let result = await contract.evaluateTransaction('getAll')

        res.status(200).json({ data: JSON.parse(result.toString()) })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// update lac test application by nisa
router.put('/lactest/:applicationId', getNetworkInfo, async (req, res) => {
    try {
        let { fpoId, userId, network } = req.session
        let { applicationId } = req.params

        const contract = network.getContract(CHAINCODE_NAME.LAC_SAMPLE_TEST_APPLICATION)

        let result = await contract.submitTransaction('updateCertificate', applicationId, JSON.stringify(req.body))

        res.status(200).json({ data: result.toString() })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

module.exports = router