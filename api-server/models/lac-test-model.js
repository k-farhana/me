const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { String, Number } = mongoose.Schema.Types;

const lacTestSchema = new schema({
    testId: String,
    category: String,
    testName: String,
    minRequiredQuantity: Number,
    testFee: Number,
    reportingPeriod: Number

}, { timestamps: true });

module.exports = mongoose.model('LacTest', lacTestSchema)