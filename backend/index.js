const server = require('./app').server
const config = require('./utils/config')
const logger = require('./utils/logger')

const PORT = config.PORT
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})