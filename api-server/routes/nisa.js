const router = require('express').Router()

const CropAdvisoryModel = require('../models/crop-advisory-model')
const TraningModel = require('../models/traning-model')
const { HandleResponseError } = require('../utils/handleResponseError')

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
        let { traningId,courseName, courseStartDate, duration, applicationStartDate, applicationEndDate, fee, remarks } = req.body

        let data = await TraningModel.create({ traningId,courseName, courseStartDate, duration, applicationStartDate, applicationEndDate, fee, remarks })
        
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

module.exports = router