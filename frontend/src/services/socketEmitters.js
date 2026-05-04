import socket from '../socket'

// user emitters

export const emitGetUserState = () => {
  socket.emit('user:get-user-state')
}

export const emitGetGameStatus = () => {
  socket.emit('user:get-game-status')
}

export const emitGetNewName = () => {
  socket.emit('user:get-new-name')
}

// matchmaking queue emitters

export const emitQueueJoin = () => {
  socket.emit('queue:join')
}

export const emitQueueLeave = () => {
  socket.emit('queue:leave')
}

// online game emitters

export const emitGameRecoverState = () => {
  socket.emit('game:recover-state')
}