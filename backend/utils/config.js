require('dotenv').config()

const PORT = process.env.PORT

const normalConfig = {
  PORT
}

// config for tests

const USER1_TOKEN = process.env.USER1_TOKEN
const USER1_ID = process.env.USER1_ID
const USER2_TOKEN = process.env.USER2_TOKEN
const USER2_ID = process.env.USER2_ID

const testConfig = {
  USER1_TOKEN,
  USER1_ID,
  USER2_TOKEN,
  USER2_ID,
}

const config = process.env.NODE_ENV === 'test' ? testConfig : normalConfig

module.exports = config