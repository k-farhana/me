const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { String, Boolean, Number } = mongoose.Schema.Types;

const fpoProductSchema = new schema({
    productId: String,
    productName: String,
    marketPrice: Number,
    fpoPrice: Number,
    imageUrl: String,
    isAvailable: Boolean,
    fpoId: String,
    isDeleted: Boolean
}, { timestamps: true });

module.exports = mongoose.model('FpoProductSchema', fpoProductSchema)