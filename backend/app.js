const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const logger = require('./utils/logger')

const guestUsersRouter = require('./controllers/guest-users')
const cors = require('cors')
const middleware = require('./utils/middleware')
const wsMiddleware = require('./utils/wsMiddleware')

const app = express()
const server = createServer(app)
const io = new Server(server)

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

  socket.use(wsMiddleware.incomingMessageLogger(socket))

  logger.info(`user ${userId} connected`)

  socket.on('disconnect', () => {
    logger.info(`user ${userId} disconnected`)
  })

})


module.exports = server