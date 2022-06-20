const { authUser } = require('../middlewares/auth'),
    { register, activateAccount, login } = require('../controllers/user'),
    express = require('express'),
    router = express.Router()

router.post('/register', register)
router.post('/activate', authUser, activateAccount)
router.post('/login', login)

module.exports = router