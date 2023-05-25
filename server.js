const express = require('express')
const { createServer } = require('http')
const { join } = require('path')
const { Server } = require('socket.io')
const { formatMessage } = require('./utils/messages')
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require('./utils/users')

const app = express()
const server = createServer(app)
const io = new Server(server)
const botName = 'Chat Room'

//set static folder ( html and css)
app.use(express.static(join(__dirname, 'public')))

//Run when a client connects
io.on('connection', (socket) => {
    //in specific Room
    socket.on('joinRoom', ({ username, room }) => {
        //Joined user
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        //welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome Home ! 😎'))

        //broadcast when a user connects to a room chat
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(
                    botName,
                    `A ${user.username} has joined the room chat`
                )
            )

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        })
    })

    //listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //runs when client disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(
                    botName,
                    `${user.username} has left the room chat`
                )
            )

            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            })
        }
    })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`server running on port ${PORT}`))
