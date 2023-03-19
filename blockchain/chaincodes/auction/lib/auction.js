'use strict';

const { Contract } = require('fabric-contract-api');
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');

class Auction extends Contract {

    // create auction by corporate client
    async create(ctx, id, objStr) {
        const obj = { id, ...JSON.parse(objStr) };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(obj))));
        return ctx.stub.getTxID()
    }

    async update(ctx, id, objStr) {
        const obj = { id, ...JSON.parse(objStr) };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(obj))));
        return ctx.stub.getTxID()
    }

    // placing the bid by fpos
    async placeBid(ctx, auctionId, objStr) {

        let auctionBuffer = await this.getById(ctx, auctionId);
        let auction = JSON.parse(auctionBuffer.toString());

        auction.bids.push(JSON.parse(objStr));

        await ctx.stub.putState(auctionId, Buffer.from(stringify(sortKeysRecursive(auction))));
        return ctx.stub.getTxID()
    }

    // make payment for a bid by corporate client
    async makePaymentForBid(ctx, auctionId, bidId, objStr) {
        let auctionBuffer = await this.getById(ctx, auctionId);
        let auction = JSON.parse(auctionBuffer.toString());

        let bid = auction.bids.find(bid => bid.id == bidId);

        if(!bid) {
            throw new Error(`Bid with id:${bid} does not exist for auction with id: ${auctionId}`);
        }

        // adding payment details to bid
        bid = { ...bid, ...JSON.parse(objStr) }

        // making auction as completed
        auction.status = 'completed'

        await ctx.stub.putState(auctionId, Buffer.from(stringify(sortKeysRecursive(auction))))
        return ctx.stub.getTxID()
    }

    async query(ctx, richQuery) {
        // const query = JSON.parse(richQuery);
        let data = await ctx.stub.getQueryResult(richQuery)
        return data.toString()
    }

    async getById(ctx, id) {
        const dataAsBytes = await ctx.stub.getState(id);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }
        return dataAsBytes.toString();
    }

    async getAll(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
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

module.exports = Auction;
