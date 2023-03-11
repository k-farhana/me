const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { String, Boolean, Number } = mongoose.Schema.Types;

const fpoLacProductSchema = new schema({
    productId: String,
    productName: String,
    marketPrice: Number,
    fpoPrice: Number,
    imageUrl: String,
    isProcurable: Boolean,
    fpoId: String,
    isDeleted: Boolean
}, { timestamps: true });

module.exports = mongoose.model('FpoLacProductSchema', fpoLacProductSchema)