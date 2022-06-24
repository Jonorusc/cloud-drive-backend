const mongoose = require('mongoose'),
{ ObjectId } =  mongoose.Schema,
codeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
})

module.exports = mongoose.model('Code', codeSchema)