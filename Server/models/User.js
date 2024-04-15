const mongoose = require("mongoose")

const userschema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
    }
}, {timestamps:true});

const Users = new mongoose.model("User", userschema)
module.exports = Users