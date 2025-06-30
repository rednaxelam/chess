const jwt = require('jsonwebtoken')

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

  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id) {
    return next(new Error('invalid token'))
  }

  req.userId = decodedToken.id.toString()

  next()
}

module.exports = {
  userIdExtractor
}
