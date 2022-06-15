const { validateEmail, validateLength, validateUsername } = require("../helpers/validation"),
    User = require('../models/User'),
    encrypt = require('bcrypt')

exports.register = async (req, res) =>  {
    try {
        // getting the 'response'
        const {
            first_name,
            last_name,
            email,
            password,
        } = res.body

        if(!validateEmail(email)) {
            return res.status(400).json({ 
                message: 'This email is not valid',
            })
        }

        // check if the email exists, querying the database
        const checkEmail = await User.findOne({ email })
        if(checkEmail) {
            return res.status(400).json({
                message: 'The email adress already exists, try with a different one'
            })
        }

        if(!validateLength(first_name, 3, 30)) {
            return res.status(400).json({
                message: 'The first name must between 3 and 30 characters',
            })
        }
        
        if(!validateLength(last_name, 3, 30)) {
            return res.status(400).json({
                message: 'The surname must between 3 and 30 characters',
            })
        }
        
        if(!validateLength(password, 6, 20)) {
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
        const user = new User({
            first_name,
            last_name,
            username: Username,
            email,
            password: cryptedPassword,
        }).save() 

        // return user to the frontend
        res.json(user)
    } catch(err) {
        res.status(500).json({ error: err.message})
    }
}