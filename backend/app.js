const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const logger = require('./utils/logger')

const guestUsersRouter = require('./controllers/guest-users')
const cors = require('cors')
const middleware = require('./utils/middleware')

const app = express()
const server = createServer(app)
const io = new Server(server)

const { OnlineUsers } = require('./services/OnlineUsers')
const onlineUsers = new OnlineUsers()

const wsMiddleware = require('./utils/wsMiddleware')

const { registerMatchmakingQueueHandlers } = require('./handlers/matchmakingQueueHandlers')
const { registerOnlineGameHandlers } = require('./handlers/onlineGameHandlers')

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/guest-users', guestUsersRouter)

app.use(middleware.unknownEndpoint)

app.use(middleware.errorHandler)

io.engine.use(wsMiddleware.userIdExtractor)

io.on('connection', (socket) => {

  const userId = socket.request.userId
  socket.join(`user:${userId}`)
  onlineUsers.addUserConnection(userId, socket.id)

  socket.use(wsMiddleware.incomingMessageLogger(socket))

  registerMatchmakingQueueHandlers(io, socket, onlineUsers)
  registerOnlineGameHandlers(io, socket, onlineUsers)

  logger.info(`user ${userId} connected`)

  socket.on('disconnect', () => {
    logger.info(`user ${userId} disconnected`)
    onlineUsers.removeUserConnection(userId, socket.id)
  })

})


module.exports = server