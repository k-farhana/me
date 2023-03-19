const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { String, ObjectId } = mongoose.Schema.Types;

const userSchema = new schema({
}, { timestamps: true, strict: false });

module.exports = mongoose.model('User', userSchema);