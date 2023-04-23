const router = require('express').Router()
const SupportModel = require('../models/support-model')
const { HandleResponseError } = require('../utils/handleResponseError')

router.post('/:type', async (req, res) => {
    try{
        let { type } = req.params

        let data = await SupportModel.create({ ...req.body, type })

        res.status(201).json({ data })
    }catch(err){
        HandleResponseError(err, res)
    }
})

router.get("/:type", async (req, res) => {
    try{
        let { type } = req.params

        let data = await SupportModel.find({ type }).sort({ _id: -1 })

        res.status(200).json({ data })
    }catch(err){
        HandleResponseError(err, res)
    }
})

module.exports = router