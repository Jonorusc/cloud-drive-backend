const User = require("../models/User")

// validate the email
exports.validateEmail = (email) => {
    return String(email)
    .toLocaleLowerCase()
    .match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/)
}
// validate length
exports.validateLength = (text, min, max) => {
    if(text.length > max || text.length < min)
        return false 
    return true
}
// validate the username acessing database
exports.validateUsername = async (username) => {
    // here we check user by user checking all usernames, if you find someone with the same one, change the username
    let i = false 
    do {
        let checkUsername = await User.findOne({ username })
        if(checkUsername) {
            // change username
            username += (+new Date() * Math.random()).toString().substring(0,1)
            i = true
        } else {
            i = false
        }
    } while(i)
    return username
}