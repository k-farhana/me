module.exports = function (req, res, next) {
    req.session = { fpoId: "FPO01" }

    next()
}