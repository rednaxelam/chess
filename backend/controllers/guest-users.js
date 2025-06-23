const jwt = require('jsonwebtoken')
const guestUsersRouter = require('express').Router()
const { generateRandomName } = require('../utils/name-generator')
const { v7: uuidv7 } = require('uuid')

guestUsersRouter.post('/', async (request, response) => {
  const anonymousUserForToken = {
    username: generateRandomName(),
    id: uuidv7(),
  }

  const token = await jwt.sign(anonymousUserForToken, process.env.SECRET)

  response.status(200).send({ token, username: anonymousUserForToken.username })

})

module.exports = guestUsersRouter