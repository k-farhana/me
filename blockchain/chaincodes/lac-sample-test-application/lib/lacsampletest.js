'use strict';

const { Contract } = require('fabric-contract-api');
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');

class LacSampleTestApplication extends Contract {

    async create(ctx, id, objStr) {
        const obj = { id, ...JSON.parse(objStr) }
        console.info('===== START : create lac sample test application =====');
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(obj))));
        console.info('===== END : create lac sample test application =====');
        return ctx.stub.getTxID()
    }

    async update(ctx, id, objStr) {
        const obj = { id, ...JSON.parse(objStr) }
        console.info('===== START : update lac sample test application =====');
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(obj))));
        console.info('===== END : update lac sample test application =====');
        return ctx.stub.getTxID()
    }

    async getById(ctx, id) {
        const dataAsBytes = await ctx.stub.getState(id);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }if (!dataAsBytes || dataAsBytes.length === 0) {
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

    async updateCertificate(ctx, applicationId, objStr) {
        const dataAsBytes = await ctx.stub.getState(applicationId);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`LacTestApplication with id:${id} does not exist`);
        }

        let application = JSON.parse(dataAsBytes.toString())

        // marking test as completed
        application.applicationStatus = 'completed'
        application = { ...application, ...JSON.parse(objStr) }

        await ctx.stub.putState(applicationId, Buffer.from(stringify(sortKeysRecursive(application))));

        return ctx.stub.getTxID()
    }

}

module.exports = LacSampleTestApplication;
