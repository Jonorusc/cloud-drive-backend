const mongoose = require('mongoose'),
    { ObjectId } = mongoose.Schema,
    userSchema = mongoose.Schema(
        {
            first_name: {
                type: String,
                required: [true, 'First name is required'],
                text: true,
            },
            last_name: {
                type: String,
                required: [true, 'First name is required'],
                text: true,
            },
            username: {
                type: String,
                required: [true, 'Username is required'],
                trim: true,
                text: true,
                unique: true,
            },
            email: {
                type: String,
                required: [true, 'Email is required'],
                trim: true,
            },
            password: {
                type: String,
                required: [true, 'Password is required'],
                trim: true,
            },
            picture: {
                type: String,
                trim: true,
                // default: 'https://cdn-icons-png.flaticon.com/512/21/21104.png',
            },
            verified: {
                type: Boolean,
                default: false,
            },
        },
        { timestamps: true }
    )

module.exports = mongoose.model('User', userSchema)
