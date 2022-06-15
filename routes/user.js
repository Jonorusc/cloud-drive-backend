const { register } = require('../controllers/user')

const express = require('express'),
    router = express.Router()

router.post('/register', register)

module.exports = router