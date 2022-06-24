function generateCode(length) {
    let code = '',
        schema = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQWXYZ'

    for (let i = 0; i < length; i++) {
        code += schema.charAt(Math.floor(Math.random() * schema.length))
    }

    return code
}

module.exports = generateCode
