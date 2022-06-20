const { sendEmailVerification } = require('../helpers/mailer'),
    { generateToken } = require('../helpers/tokens'),
    {
        validateEmail,
        validateLength,
        validateUsername,
    } = require('../helpers/validation'),
    User = require('../models/User'),
    encrypt = require('bcrypt'),
    jwt = require('jsonwebtoken')

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
