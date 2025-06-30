const jwt = require('jsonwebtoken')
const guestUsersRouter = require('express').Router()
const { v7: uuidv7 } = require('uuid')

guestUsersRouter.post('/', async (request, response) => {
  const anonymousUserForToken = {
    id: uuidv7(),
  }

  const token = await jwt.sign(anonymousUserForToken, process.env.SECRET)

  response.status(200).send({ token })

})

module.exports = guestUsersRouter