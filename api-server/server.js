require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./configs/database')

connectDB()

const app = express()

app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 5000 }))
app.use(morgan('dev'))

app.use("/img", express.static('uploads'))
app.use("/api", require('./routes'))

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server started on port : ${port}`)
})