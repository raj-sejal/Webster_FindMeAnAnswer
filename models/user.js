const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

//Scema Setup
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isTeacher: { type: Boolean, default: false }

});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);