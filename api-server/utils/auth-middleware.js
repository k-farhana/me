const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../configs/constants')

module.exports = function (req, res, next) {

    let authorization = req.headers.authorization || ''
    let token = authorization.split(" ").pop() || ''
    if (token == '') {
        return res.status(401).json({ error: 'Unauthorized: Token not present' })
    }

    try {
        let decoded = jwt.verify(token, JWT_SECRET)

        let { fpoId, mspId, userId } = decoded

        req.session = { fpoId, mspId, userId }

        next()
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: Token expired' })
    }
}