const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Date,
        required: true,
    },
    profilePicture: {
        type: String,
        default: ""
    },
    qrCode: {
        type: String,
        default: ""
    }
})

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel