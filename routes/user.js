const { register } = require('../controllers/user')

const express = require('express'),
    router = express.Router()

router.get('/user', register)

module.exports = router