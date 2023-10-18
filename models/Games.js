const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    game: {
        type: String,
        required: true,
    },
    players: {
        type: [String],
        default: ["", ""]
    },
    time: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        required: true,
    }
})

const UserModelMatch = mongoose.model("MatchHistory", UserSchema)
module.exports = UserModelMatch