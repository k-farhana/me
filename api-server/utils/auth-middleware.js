module.exports = function (req, res, next) {
    req.session = { fpoId: "FPO01", mspId: 'Org1MSP', userId: 'user2' }

    next()
}