require('dotenv').config()

const PORT = process.env.PORT

const normalConfig = {
  PORT
}

// config for tests

const USER1_TOKEN = process.env.USER1_TOKEN
const USER2_TOKEN = process.env.USER2_TOKEN

const testConfig = {
  USER1_TOKEN,
  USER2_TOKEN,
}

const config = process.env.NODE_ENV === 'test' ? testConfig : normalConfig

module.exports = config