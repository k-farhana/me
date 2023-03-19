const router = require('express').Router()
const { uuid } = require('uuidv4')
const moment = require('moment')

const { CHAINCODE_NAME, LOAN_WINDOW_STATUS, LOAN_WINDOW_TYPES, LOAN_WINDOW_STATUSES, LOAN_STATUS, LOAN_STATUSES } = require('../configs/constants')
const { HandleResponseError, RequestInputError } = require('../utils/handleResponseError')
const { getNetworkInfo } = require('../utils/networkUtils')

// creates fpo / farmer window by FPO
router.post('/', getNetworkInfo, async (req, res) => {
    try {
        const { userId, network } = req.session
        const { windowType } = req.body

        if (!LOAN_WINDOW_TYPES.includes(windowType)) {
            throw new RequestInputError({ code: 422, message: "Invalid windowType, possible values 'fpo', 'farmer'." })
        }

        const contract = network.getContract(CHAINCODE_NAME.LOAN)

        let id = uuid()
        let additionalFields = {
            id,
            grantedAmount: -1,
            consumedWindowLoanAmount: 0,
            status: LOAN_WINDOW_STATUS.PENDING,
            windowRepaymentStructure: [],
            loans: []
        }

        let windowObj = { ...req.body, ...additionalFields }
        const result = await contract.submitTransaction('createLoanWindow', id, JSON.stringify(windowObj))

        res.status(201).json({ data: result.toString() })
    } catch (err) {
        HandleResponseError(err, res)
    }
})

// get loan window list for Samunnati / FPO 
router.get('/', getNetworkInfo, async (req, res) => {
    try {
        let { fpoId = "", userId, network } = req.session
        let { windowType } = req.query

        if (!LOAN_WINDOW_TYPES.includes(windowType)) {
            throw new RequestInputError({ code: 422, message: "Invalid windowType, possible values 'fpo', 'farmer'." })
        }

        const contract = network.getContract(CHAINCODE_NAME.LOAN)

        const result = await contract.evaluateTransaction('getLoanWindow', fpoId, windowType)

        res.status(201).json({ data: JSON.parse(result.toString()) })

    } catch (err) {
        HandleResponseError(err, res)
    }
})

// approval for loan window
router.put('/:windowId/approval', getNetworkInfo, async (req, res) => {
    try {
        let { userId, network } = req.session
        let { windowId } = req.params
        let { status = "", grantedAmount } = req.body

        if (!LOAN_WINDOW_STATUSES.includes(status)) {
            throw new RequestInputError({ message: 'Invalid loan window approval status, possible values "approved", "rejected"' })
        }

        const contract = network.getContract(CHAINCODE_NAME.LOAN)

        let approvalObj = {
            ...req.body,
            approvalDate: moment().format()
        }

        if (status == LOAN_WINDOW_STATUS.APPROVED) {
            approvalObj.grantedAmount = parseInt(grantedAmount)
            approvalObj['grantedAmountUtilized'] = 0
        }

        const result = await contract.submitTransaction('loanWindowApproval', windowId, JSON.stringify(approvalObj))

        res.status(201).json({ data: result.toString() })

    } catch (err) {
        HandleResponseError(err, res)
    }
})

// creates loan for a windowId from both FPO and FARMER
router.post('/:windowId/loan', getNetworkInfo, async (req, res) => {
    try {
        let { fpoId, userId, network } = req.session
        let { windowId } = req.params
        let { loanWindowId = "" } = req.body

        if (loanWindowId == "") {
            throw new RequestInputError({ message: "Loan window id is required" })
        }

        // TODO check for farmer loan alone to check if FPO has enabled the loan application

        const contract = network.getContract(CHAINCODE_NAME.LOAN)

        let id = uuid()
        let additionalFields = {
            id,
            windowId,
            userId,
            fpoId,
            status: LOAN_STATUS.IN_PROCESS,
            createdAt: moment().format()
        }

        let loanObj = { ...req.body, ...additionalFields }
        const result = await contract.submitTransaction('applyLoan', windowId, id, JSON.stringify(loanObj))

        res.status(201).json({ data: result.toString() })

    } catch (err) {
        HandleResponseError(err, res)
    }
})

// loan approval from samunnati / fpo (for farmer loan)
router.put('/:windowId/loan/:loanId/approval', getNetworkInfo, async (req, res) => {
    try {
        let { fpoId, userId, network } = req.session
        let { windowId, loanId } = req.params
        let { fpoApprovalStatus } = req.body

        if (windowId == "") {
            throw new RequestInputError({ message: "Loan window id is required" })
        }
        
        if(fpoId && (fpoId == userId)) {
            // which means fpo approval
            if(!LOAN_STATUSES.includes(fpoApprovalStatus)) {
                throw new RequestInputError({ message: "Invalid fpoApprovalStatus, possible values 'approved', 'rejected'" })
            }
            req.body['fpoApprovalAt'] = moment().format()
        }else{
            req.body['approvalAt'] = moment().format()
        }

        const contract = network.getContract(CHAINCODE_NAME.LOAN)

        const result = await contract.submitTransaction('approveLoan', windowId, loanId, JSON.stringify(req.body))

        res.status(201).json({ data: result.toString() })

    } catch (err) {
        HandleResponseError(err, res)
    }
})

// get all loans of farmer / fpo
router.get('/loan', getNetworkInfo, async (req, res) => {
    try {
        let { fpoId, userId, network } = req.session
        let { type = "" } = req.query

        if(!['fpo', 'farmer'].includes(type)){
            throw new RequestInputError({ message: "Invalid value for type, possible values 'fpo', 'farmer'" })
        }

        const contract = network.getContract(CHAINCODE_NAME.LOAN)

        let id = type == 'fpo' ? fpoId : userId 

        const result = await contract.evaluateTransaction('getLoan', type, id)

        res.status(200).json({ data: JSON.parse(result.toString()) })

    } catch (err) {
        HandleResponseError(err, res)
    }
})



module.exports = router