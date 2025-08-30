import { io } from 'socket.io-client'
import config from './utils/config'

export const socket = io(config.socketURL, {
  autoConnect: false
})