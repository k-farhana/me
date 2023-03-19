const router = require('express').Router()
const { uuid } = require('uuidv4')
const moment = require('moment')

const { CHAINCODE_NAME, AUCTION_STATUS } = require('../configs/constants')
const { HandleResponseError } = require('../utils/handleResponseError')
const { getNetworkInfo } = require('../utils/networkUtils')

// create auction by corporate client
router.post('', getNetworkInfo, async (req, res) => {
    try {
        let { userId, network } = req.session

        const contract = network.getContract(CHAINCODE_NAME.AUCTION)

        let id = uuid()
        let additionalFields = {
            id,
            userId,
            status: AUCTION_STATUS.ON_GOING,
            bids: []
        }

        let auction = { ...req.body, ...additionalFields }
        let result = await contract.submitTransaction('create', id, JSON.stringify(auction))

        res.status(201).json({ data: result.toString() })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// place bid by FPO's
router.post('/:auctionId/bid', getNetworkInfo, async (req, res) => {
    try {
        let { userId, network } = req.session
        let { auctionId } = req.params

        const contract = network.getContract(CHAINCODE_NAME.AUCTION)

        let bidId = uuid()
        let bid = { id: bidId, userId, ...req.body }

        let result = await contract.submitTransaction('placeBid', auctionId, JSON.stringify(bid))

        res.status(201).json({ data: result.toString() })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// make payment to FPO by corporate client
router.post('/:auctionId/bid/:bidId/payment', getNetworkInfo, async (req, res) => {
    try {
        let { network } = req.session
        let { auctionId, bidId } = req.params

        const contract = network.getContract(CHAINCODE_NAME.AUCTION)
        let paymentObj = { ...req.body, createdAt: moment().format() }

        let result = await contract.submitTransaction('makePaymentForBid', auctionId, bidId, JSON.stringify(paymentObj))

        res.status(201).json({ data: result.toString() })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// get auction list
router.get('/', getNetworkInfo, async (req, res) => {
    try {
        let { network } = req.session

        const contract = network.getContract(CHAINCODE_NAME.AUCTION)

        let result = await contract.evaluateTransaction('getAll')

        res.status(201).json({ data: JSON.parse(result.toString()) })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

module.exports = router