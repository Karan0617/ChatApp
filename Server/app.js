const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const io = require("socket.io")(2020, {
    cors: {
        origin: 'http://localhost:5173'
    }
})
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
dotenv.config("dotenv")
// connect db 
require("./DB/connection.js")

// Import Files
const PORT = process.env.PORT

let users = []
io.on('connection', socket => {
    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId)
        if (!isUserExist) {
            const user = { userId, socketId: socket.id }
            users.push(user)
            io.emit('getUsers', users)
        }
    })

    socket.on('sendMessage', async ({ senderId, conversationId, message, receiverId }) => {
        const receiver = users.find(user => user.userId === receiverId)
        const sender = users.find(user => user.userId === senderId)
        const user = await Users.findById(senderId)
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                conversationId,
                message,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            })
        } else {
            io.to(sender.socketId).emit('getMessage', {
                senderId,
                conversationId,
                message,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            })
        }
    })

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id)
        io.emit('getUsers', users)
    })
})


const Users = require('./models/User.js')
const Conversations = require('./models/Conversations.js')
const Message = require('./models/Message.js')

//app use
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Routes
app.get('/', (req, res) => { res.send('welcome') })

app.post("/api/register", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            res.status(200).send('user register successfully')
        } else {
            const isAlreadyExist = await Users.findOne({ email })
            if (isAlreadyExist) {
                res.status(400).send('User Already Exist')
            } else {
                const newUser = new Users({ fullName, email })
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    newUser.set('password', hashedPassword)
                    newUser.save()
                })
                return res.status(200).send('User Registered Successfully')
            }
        }
    } catch (error) {
        console.log(error.message)
    }
})

app.post('/api/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).send('please fill all required fields')
        } else {
            const user = await Users.findOne({ email });
            if (!user) {
                res.status(400).send('User email or password is incorrect')
            } else {
                const validateUser = await bcrypt.compare(password, user.password)
                if (!validateUser) {
                    res.status(400).send('User email or password is incorrect')
                } else {
                    const payload = {
                        userId: user._id,
                        email: user.email
                    }
                    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'This is A JWT_SECRET_KEY'
                    jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
                        await Users.updateOne({ _id: user._id }, { $set: { token: token } })
                        user.save()
                        return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token: token })
                    })
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
})

app.post('/api/logout', async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log("Error in logout controller", error.message)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversations({ members: [senderId, receiverId] })
        await newConversation.save()
        res.status(200).send('conversation created successfully')
    } catch (error) {
        console.log(error)
    }
})

app.get('/api/conversation/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversations.find({ members: { $in: [userId] } })
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId)
            const user = await Users.findById(receiverId)
            return { user: { receiverId:user._id, email: user.email, fullName: user.fullName }, conversationId: conversation._id }
        }))
        res.status(200).json(await conversationUserData)
    } catch (error) {
        console.log(error)
    }
})

app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body
        if (!senderId || !message) return res.status(400).send('please fill all the required fields')
        if (conversationId === 'new' && receiverId) {
            const newConversation = new Conversations({ members: [senderId, receiverId] })
            await newConversation.save()
            const newMessage = new Message({ conversationId: newConversation._id, senderId, message })
            await newMessage.save()
            return res.status(200).send('Message Sent successfully')
        } else if (!conversationId && !receiverId) {
            return res.status(400).json('please fill all required fields')
        }
        const newMessage = new Message({ conversationId, senderId, message })
        await newMessage.save();
        res.status(200).send("Message send successfully")
    } catch (error) {
        console.log("msg err", error.message)
    }
})

app.get('/api/message/:conversationId', async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            const messages = await Message.find({ conversationId })
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await Users.findById(message.senderId)
                return { user: { id: user._id, email: user.email, fullName: user.fullName }, message: message.message }
            }))
            res.status(200).json(await messageUserData)
        }
        const conversationId = req.params.conversationId
        if (conversationId === 'new') {
            const checkConversation = await Conversations.find({ members: { $all: [req.query.senderId, req.query.receiverId] } })
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id)
            } else {
                return res.status(200).json([])
            }
        } else {
            checkMessages(conversationId)
        }
    } catch (error) {
        console.log(error)
    }
})

app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const users = await Users.find({ _id: { $ne: userId } })
        const userData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, fullName: user.fullName, receiverId: user._id } }
        }))
        res.status(200).json(await userData)
    } catch (error) {
        console.log(error)
    }
})


app.listen(PORT, () => { console.log(`db is connected on port number ${PORT}`) })