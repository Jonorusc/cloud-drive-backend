const { sendEmailVerification, sendCodeVerification } = require('../helpers/mailer'),
    { generateToken } = require('../helpers/tokens'),
    {
        validateEmail,
        validateLength,
        validateUsername,
    } = require('../helpers/validation'),
    User = require('../models/User'),
    Code = require('../models/Code'),
    encrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    generateCode = require('../helpers/generateCode')


exports.register = async (req, res) => {
    try {
        // getting the 'response'
        const { first_name, last_name, email, password } = req.body

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: 'This email is not valid',
            })
        }

        // check if the email exists, querying the database
        const checkEmail = await User.findOne({ email })
        if (checkEmail) {
            return res.status(400).json({
                message:
                    'The email adress already exists, try with a different one',
            })
        }

        if (!validateLength(first_name, 3, 30)) {
            return res.status(400).json({
                message: 'The first name must between 3 and 30 characters',
            })
        }

        if (!validateLength(last_name, 3, 30)) {
            return res.status(400).json({
                message: 'The surname must between 3 and 30 characters',
            })
        }

        if (!validateLength(password, 6, 20)) {
            return res.status(400).json({
                message: 'The passwrod must be atleast 6 characters',
            })
        }

        // encrypting the password
        const cryptedPassword = await encrypt.hash(password, 15)

        // creating a username for the customer to identify it in the database
        let intialUsername = first_name + last_name,
            Username = await validateUsername(intialUsername)

        // save the model in database
        const user = await new User({
            first_name,
            last_name,
            username: Username.replace(/ /g, ''),
            email,
            password: cryptedPassword,
        }).save()

        const emailVerificationToken = generateToken(
                { id: user._id.toString() },
                '60m'
            ),
            url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`

        // get customer data and send them an email
        sendEmailVerification(user.email, user.first_name, url)

        const token = generateToken({ id: user._id.toString() }, '7d')

        // return user to the frontend
        res.json({
            id: user._id,
            username: user.username,
            picture: user.picture,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            token,
            verified: user.verified,
            message:
                'Account created successfully! Check your email to activate your account',
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
// activate user account
exports.activateAccount = async (req, res) => {
    try {
        const validUser = req.user,
            { token } = req.body,
            user = jwt.verify(token, process.env.TOKEN_SECRET),
            check = await User.findById(user.id)

        if (validUser.id !== user.id) {
            return res.status(400).json({
                message: 'You are not allowed to do this',
            })
        }
        if (check.verified == true) {
            return res
                .status(400)
                .json({ message: 'This email is already activated.' })
        } else {
            await User.findByIdAndUpdate(user.id, { verified: true })
            return res.status(200).json(
                { message: 'Account has beeen activated successfully.' }
            )
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
// log-in
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body,
            user = await User.findOne({ email }),
            check = await encrypt.compare(password, user.password)

        if (!user)
            return res.status(400).json({
                message:
                    'The email adress you entered is not linked to an account',
            })

        if (!check)
            return res
                .status(400)
                .json({ message: 'Invalid credentials. Please try again' })

        const token = generateToken({ id: user._id.toString() }, '7d')
        res.send({
            id: user._id,
            username: user.username,
            email: user.email,
            picture: user.picture,
            first_name: user.first_name,
            last_name: user.last_name,
            token,
            verified: user.verified,
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
// send verification
exports.sendVerification = async (req, res) => {
    try {
        const id = req.user.id
        const user = await User.findById(id)

        if(user.verified) 
            return res.status(400).json({ message: 'This account is already activated!' })

        const emailVerificationToken = generateToken(
            { id: user._id.toString()},
            '30m'
        )
        const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`
        sendEmailVerification(user.email, user.first_name, url)

        return res.status(200).json({
            message: 'A verification email has been sent you. Expires in 30 minutes',
        })
    } catch (err) {
        return res.status(500).json({ message: 'There was en error, try again later....' })
    }
}   
// find a user
exports.findUser = async (req, res) => {
    try {
        const email = req.body.email,
        user = await User.findOne({ email }).select('-password')

        if(!user) {
            return res.status(400).json({
                message: 'Account does not exist!'
            })
        } else {
            return res.status(200).json({
                email: user.email,
                first_name: user.first_name,
                picture: user.picture,
                message: 'true'
            })
        }

    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
}
// reset password
exports.sendResetCode = async (req, res) => {
    try {
        const { email } = req.body,
        user = await User.findOne({ email }).select('-password')

        await Code.findOneAndRemove({ user:user._id })
        const code = generateCode(6),
        savedCode = await new Code({
            code,
            user: user._id,
        }).save()

        sendCodeVerification(user.email, user.first_name, code)

        return res.status(200).json({
            message: 'An email with the code verification has been sent to your email'
        })

    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
} 

// validate code
exports.validateResetCode = async (req, res) => {
    try {
        const { email, code } = req.body,
        user = await User.findOne({ email }),
        db_code = await Code.findOne({ user:user._id })

        if(db_code.code !== code) {
            return res.status(400).json({
                message: 'Verification code is wrong!',
            })
        } 
        return res.status(200).json({message: 'true'})
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
}
// change password
exports.changePassword = async (req, res) => {
    try {
        const { email, password } = req.body,
        cryptedPassword = await encrypt.hashSync(password, 15)
        
        await User.findOneAndUpdate({ email }, {
            password: cryptedPassword,
        })

        return res.status(200).json({
            message: 'true'
        })
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
}