const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
    },
    senderId:{
        type:String
    },
    message:{
        type:String
    }
}, {timestamps:true});
const Message = new mongoose.model("Message", messageSchema)

module.exports = Message