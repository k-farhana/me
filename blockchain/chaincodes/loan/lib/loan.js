'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const moment = require('moment')

class Loan extends Contract {

    // creates a loan window
    async createLoanWindow(ctx, id, objStr) {
        const obj = JSON.parse(objStr)
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(obj))));
        return ctx.stub.getTxID()
    }

    // retrieve load window
    async getLoanWindow(ctx, fpoId, windowType) {
       
        let richQuery = { "selector": { "windowType": { "$eq": windowType } } }
        
      

        to retrieve only for fpoId
        if (fpoId != "") {
            richQuery.selector["fpoId"] = fpoId
        }

        let iterator = await ctx.stub.getQueryResult(JSON.stringify(richQuery))

        return await this.iterateAndFetch(iterator)
    }

    // approval of loan window by samunnati
    async loanWindowApproval(ctx, loanWindowId, objStr) {
        let approval = JSON.parse(objStr)

        const dataAsBytes = await ctx.stub.getState(loanWindowId);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`Loan window with id: ${id} does not exist`);
        }

        let loanWindow = JSON.parse(dataAsBytes.toString())

        loanWindow = { ...loanWindow, ...approval }

        // calculating and setting repayment structure
        if (loanWindow.status == 'approved') {
            let { grantedAmount, windowPeriod, intrest } = loanWindow

            grantedAmount = parseInt(grantedAmount)
            windowPeriod = parseInt(windowPeriod)
            intrest = parseFloat(intrest)

            let { repaymentStructure, totalPayable } = this.calculateRepaymentStructure(grantedAmount, intrest, windowPeriod)
            loanWindow['totalRepayableAmount'] = totalPayable
            loanWindow.windowRepaymentStructure = repaymentStructure
        }

        await ctx.stub.putState(loanWindowId, Buffer.from(stringify(sortKeysRecursive(loanWindow))));
        return ctx.stub.getTxID()
    }

    // apply Loan from a loan window
    async applyLoan(ctx, loanWindowId, loanId, objStr) {

        let loan = JSON.parse(objStr)

        const dataAsBytes = await ctx.stub.getState(loanWindowId);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`Loan window with id: ${id} does not exist`);
        }

        let loanWindow = JSON.parse(dataAsBytes.toString())

        // setting loan for farmer / fpo based on window type
        loan['loanFor'] = loanWindow.windowType

        if (loan.loanFor == 'farmer') {
            loan.fpoApprovalStatus = 'in-process'
        }

        if ((loanWindow.grantedAmountUtilized + loan.requestedAmount) > loanWindow.grantedAmount) {
            throw new Error(`Loan amount: ${loan.requestedAmount} exceeds available loan window amount`)
        }

        loanWindow.grantedAmountUtilized += loan.requestedAmount

        // adding to loan window
        loanWindow.loans.push(loan)

        if (loan.loanFor == 'farmer') {
            // inserting new object of type loan 
            // so that loan can be filtered by userId to fetch loan for a farmer
            await ctx.stub.putState(loanId, Buffer.from(stringify(sortKeysRecursive(loan))))
        }

        // updating the loan window
        await ctx.stub.putState(loanWindowId, Buffer.from(stringify(sortKeysRecursive(loanWindow))))

        return ctx.stub.getTxID()
    }

    // approve loan from a loan window
    async approveLoan(ctx, loanWindowId, loanId, objStr) {

        let obj = JSON.parse(objStr)

        const dataAsBytes = await ctx.stub.getState(loanWindowId);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`Loan window with id: ${loanWindowId} does not exist`);
        }

        let loanWindow = JSON.parse(dataAsBytes.toString())
        let loanIndex = loanWindow.loans.findIndex(loan => loan.id == loanId)

        if (loanIndex == -1) {
            throw new Error(`Loan with id: ${loanId} not found in window with id: ${windowId}`)
        }

        let loan = loanWindow.loans[loanIndex]

        let isFpoApproval = false

        if (loan.loanFor == 'farmer') {
            if (loan.fpoApprovalStatus == 'rejected') {
                throw new Error(`FPO already rejected the loan for the farmer`)
            }

            if (loan.fpoApprovalStatus == 'in-process') {
                if (!obj.fpoApprovalStatus) {
                    throw new Error(`Loan needs to be approved by FPO first`)
                }
                isFpoApproval = true
            }
        }

        // only for farmer loan fpo approval
        if (isFpoApproval) {
            loan = { ...loan, ...obj }

            loanWindow.loans[loanIndex] = loan

            // updating the separate loan obj
            await ctx.stub.putState(loanId, Buffer.from(stringify(sortKeysRecursive(loan))))

            // updating the loan window
            await ctx.stub.putState(loanWindowId, Buffer.from(stringify(sortKeysRecursive(loanWindow))))

            return ctx.stub.getTxID()
        }

        loan = { ...loan, ...obj }

        loanWindow.loans[loanIndex] = loan

        // updating the separate loan obj
        if (loan.loanFor == 'farmer') {

            // calculating and setting repayment structure
            if (loan.status == 'approved') {
                let { intrest, loanTenure, grantedAmount } = loan
                intrest = parseFloat(intrest)
                loanTenure = parseInt(loanTenure)
                grantedAmount = parseInt(grantedAmount)

                let { repaymentStructure, totalPayable } = this.calculateRepaymentStructure(grantedAmount, intrest, loanTenure)

                loan['repaymentStructure'] = repaymentStructure
                loan['totalRepayableAmount'] = totalPayable
            }

            await ctx.stub.putState(loanId, Buffer.from(stringify(sortKeysRecursive(loan))))
        }

        // updating the loan window
        await ctx.stub.putState(loanWindowId, Buffer.from(stringify(sortKeysRecursive(loanWindow))))

        return ctx.stub.getTxID()

    }

    // list all loans got by the farmer / fpo
    async getLoan(ctx, type, id) {

        let richQuery = { selector: { loanFor: { $eq: 'farmer' } } }

        if (type == 'fpo') {
            richQuery.selector["fpoId"] = { $eq: id }
        } else if (type == 'farmer') {
            richQuery.selector["userId"] = { $eq: id }
        } else {
            throw new Error('Invalid type passed to getLoan')
        }

        let iterator = await ctx.stub.getQueryResult(JSON.stringify(richQuery))
        return await this.iterateAndFetch(iterator)
    }

    // add repayment info for loan window by samunnati
    async makeFpoLoanWindowRepayment(ctx, loanWindowId, objStr ) {
        let { repaymentId, paymentDate, paidAmount } = JSON.parse(objStr)

        const dataAsBytes = await ctx.stub.getState(loanWindowId);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`Loan window with id: ${loanWindowId} does not exist`);
        }

        let loanWindow = JSON.parse(dataAsBytes.toString())

        let repaymentIndex = loanWindow.windowRepaymentStructure.findIndex(repaymentObj => repaymentObj.id == repaymentId)

        if(repaymentIndex == -1) {
            throw new Error(`Repayment structure with id : ${repaymentId} does not exist`)
        }

        let repaymentObj = loanWindow.windowRepaymentStructure[repaymentIndex]

        if(repaymentObj.paymentDate != "" || repaymentObj.paidAmount > 0) {
            throw new Error(`Payment for repayment id: ${repaymentId} already done`)
        }

        // updating values about payment
        repaymentObj.paymentDate = paymentDate
        repaymentObj.paidAmount = paidAmount

        // updating the loan window
        await ctx.stub.putState(loanWindowId, Buffer.from(stringify(sortKeysRecursive(loanWindow))))

        return ctx.stub.getTxID()
    }

    // helper function to create repayment structure
    calculateRepaymentStructure(principle, intrest, tenureInMonths) {
        let emiPerMonth = Math.round(this.calculateEMI(principle, intrest, tenureInMonths))
        let totalPayable = Math.round(emiPerMonth * tenureInMonths)

        let tempTotalPayable = totalPayable

        let repaymentStructure = []

        let d = new Date()

        for (let i = 0; i < tenureInMonths; i++) {
            // calculate totalPayable
            tempTotalPayable -= emiPerMonth

            let obj = {
                id: i + 1,
                repaymentDate: moment(d).format('DD-MM-YYYY'),
                emi: emiPerMonth,
                balance: totalPayable,
                paymentDate: "",
                paidAmount: 0
            }
            repaymentStructure.push(obj)

            d.setMonth(d.getMonth() + 1)
        }

        return { repaymentStructure, totalPayable }
    }

    // helper function to calculate emi per month
    calculateEMI(p, i, n) {
        let r = (i / 12) / 100
        let emi = p * r * (Math.pow((1 + r), n) / (Math.pow((1 + r), n) - 1))
        return emi
    }

    // helper function query iterator
    async iterateAndFetch(iterator) {
        console.info('calling iterator')
        let allResults = []

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = Loan;
