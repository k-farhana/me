const router = require('express').Router()

const FarmerProduceModel = require('../models/farmer-produce-model')
const { HandleResponseError } = require('../utils/handleResponseError')

// create farmer 
router.post('/produce', async (req, res) => {
    try {
        let { userId } = req.session

        let data = await FarmerProduceModel.create({ farmerId: userId, ...req.body })

        res.status(201).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.get('/:farmerId/produce', async (req, res) => {
    try {
        let { farmerId } = req.params

        let data = await FarmerProduceModel.find({ farmerId })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

module.exports = router