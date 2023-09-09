const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: ""
    },
    id: {
        type: String,
        required: true,
    },
})

const UserModelActive = mongoose.model("actives", UserSchema)
module.exports = UserModelActive