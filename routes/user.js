const { authUser } = require('../middlewares/auth'),
    {
        register,
        activateAccount,
        login,
        sendVerification,
        findUser,
        sendResetCode,
        validateResetCode,
        changePassword,
    } = require('../controllers/user'),
    express = require('express'),
    router = express.Router()

router.post('/register', register)
router.post('/activate', authUser, activateAccount)
router.post('/login', login)
router.post('/sendverification', authUser, sendVerification)
router.post('/finduser', findUser)
router.post('/sendresetcode', sendResetCode)
router.post('/validateresetcode', validateResetCode)
router.post('/changepassword', changePassword)


module.exports = router
