const FpoLacProductModel = require('../models/fpo-lac-product-model')
const FpoProductModel = require('../models/fpo-product-model')
const { UploadToDisk } = require('../utils/fileUpload')
const { HandleResponseError } = require('../utils/handleResponseError')

const router = require('express').Router()

router.post('/product', UploadToDisk.single('productImg'), async (req, res) => {
    try {
        let { fpoId } = req.session
        let { productId, productName, marketPrice, fpoPrice, isAvailable = false } = req.body
        let { originalName, generatedName } = req.file

        let data = await FpoProductModel.create({ productId, productName, marketPrice, fpoPrice, imageUrl: generatedName, isAvailable, fpoId, isDeleted: false })

        res.status(201).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.get('/product', async (req, res) => {
    try {
        let { fpoId } = req.session

        let data = await FpoProductModel.find({ isDeleted: false, fpoId })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.put('/product/:id', UploadToDisk.single('productImg'), async (req, res) => {
    try {
        let { fpoId } = req.session
        let { id } = req.params

        let { productId, productName, marketPrice, fpoPrice, isAvailable, isDeleted = false } = req.body
        let { originalName, generatedName } = req.file

        let data = await FpoProductModel.updateOne({ _id: id }, { productId, productName, marketPrice, fpoPrice, imageUrl: generatedName, isAvailable, fpoId, isDeleted })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

/** fpo - lac apis  */
router.post('/lac', UploadToDisk.single('productImg'), async (req, res) => {
    try {
        let { fpoId } = req.session
        let { productId, productName, marketPrice, fpoPrice, isProcurable = true } = req.body
        let { originalName, generatedName } = req.file

        let data = await FpoLacProductModel.create({ productId, productName, marketPrice, fpoPrice, imageUrl: generatedName, isProcurable, fpoId, isDeleted: false })

        res.status(201).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.get('/lac', async (req, res) => {
    try {
        let { fpoId } = req.session

        let data = await FpoLacProductModel.find({ isDeleted: false, fpoId })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

router.put('/lac/:id', UploadToDisk.single('productImg'), async (req, res) => {
    try {
        let { fpoId } = req.session
        let { id } = req.params
        let { productId, productName, marketPrice, fpoPrice, isProcurable = true, isDeleted = false } = req.body
        let { originalName, generatedName } = req.file

        let data = await FpoLacProductModel.updateOne({ _id: id },{ productId, productName, marketPrice, fpoPrice, imageUrl: generatedName, isProcurable, fpoId, isDeleted })

        res.status(200).json({ data })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

module.exports = router