const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { String, Number } = mongoose.Schema.Types;

const supportSchema = new schema({
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Support', supportSchema)