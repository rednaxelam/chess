import { io } from 'socket.io-client'
import config from './utils/config'

export default io(config.socketURL, {
  autoConnect: false
})