const jwt = require('jsonwebtoken')
const logger = require('./logger')

const userIdExtractor = (req, res, next) => {
  const isHandshake = req._query.sid === undefined
  if (!isHandshake) {
    return next()
  }

  const authorization = req.headers['authorization']

  if (!authorization) {
    return next(new Error('no token'))
  }

  if (!authorization.startsWith('Bearer ')) {
    return next(new Error('invalid token'))
  }

  const token = authorization.replace('Bearer ', '')

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    return next(error)
  }
  

  if (!decodedToken.id) {
    return next(new Error('invalid token'))
  }

  req.userId = decodedToken.id.toString()

  next()
}

const incomingMessageLogger = (socket) => ([event, ...args], next) => {
  logger.info('---Incoming WS Message---')
  logger.info('User Id:', socket.request.userId)
  logger.info('Event Name:', event)
  logger.info('Message:', args.join(',\n '))
  logger.info('---')
  next()
}

module.exports = {
  userIdExtractor,
  incomingMessageLogger,
}
