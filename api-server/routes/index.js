const router = require('express').Router()

const auth = require('../utils/auth-middleware')

router.use('/nisa', auth, require('./nisa'))
router.use('/fpo', auth, require('./fpo-products'))

module.exports = router