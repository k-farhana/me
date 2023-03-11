const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { String } = mongoose.Schema.Types;

const traningSchema = new schema({
    traningId: String,
    courseName: String,
    courseStartDate: String,
    duration: String,
    applicationStartDate: String,
    applicationEndDate: String,
    fee: String,
    remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Traning', traningSchema)