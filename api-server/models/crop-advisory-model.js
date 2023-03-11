const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { String, ObjectId } = mongoose.Schema.Types;

const cropAdvisorySchema = new schema({
    cropAdvisoryId: String,
    title: String,
    content: String,
    // createdBy: { type: ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CropAdvisory', cropAdvisorySchema)