const mongoose = require("mongoose");

//Scema Setup
var AnswerSchema = new mongoose.Schema({
    answer: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: { type: Date, default: Date.now },
    upVotes: Number,
    downVotes: Number
});

module.exports = mongoose.model('Answer', AnswerSchema);