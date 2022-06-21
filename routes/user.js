const { authUser } = require('../middlewares/auth'),
    { register, activateAccount, login, sendVerification } = require('../controllers/user'),
    express = require('express'),
    router = express.Router()

router.post('/register', register)
router.post('/activate', authUser, activateAccount)
router.post('/login', login)
router.post('/sendverification', authUser, sendVerification)

module.exports = router