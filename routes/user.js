const { register } = require('../controllers/user')

const express = require('express'),
    router = express.Router()

router.post('/user', register)

module.exports = router