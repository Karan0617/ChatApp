const mongoose = require("mongoose")

const conversationSchema = new mongoose.Schema({
    members: {
        type: Array,
        required:true
    },

}, {timestamps:true});

const Conversations = new mongoose.model("Conversations", conversationSchema)

module.exports = Conversations