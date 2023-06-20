const mongoose = require('mongoose');
//Schema Setup
var QuestionSchema = new mongoose.Schema({
    question: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    answer: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Answer"
        }
    ],
    subject: String,
    description: String,
    created: { type: Date, default: Date.now },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    upVotes: Number,
    downVotes: Number
});

module.exports = mongoose.model('Question', QuestionSchema);
