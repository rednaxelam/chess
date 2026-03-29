import socket from '../socket'

export const emitGetUserState = () => {
  socket.emit('user:get-user-state')
}
