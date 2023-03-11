const mongoose = require('mongoose');

module.exports = async function () {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("DB connected");
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}