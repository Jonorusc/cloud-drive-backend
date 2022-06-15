const { register, actovateAccount, login } = require('../controllers/user')

const express = require('express'),
    router = express.Router()

router.post('/register', register)
router.post('/activate', actovateAccount)
router.post('/login', login)

module.exports = router