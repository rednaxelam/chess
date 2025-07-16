const registerMatchmakingQueueHandlers = (io, socket, onlineUsers) => {

  const joinQueue = () => {
    const userId = socket.request.userId
    
    const result = onlineUsers.joinMatchmakingQueue(userId)

    if (result.statusCode === 0) {
      if (result.data.length === 0) {
        io.to(`user:${userId}`).emit('queue:joined')
      } else {
        io.to(`user:${userId}`).emit('game:joined')
      }
    } else {
      io.to(`user:${userId}`).emit('queue:failure', {statusCode: result.statusCode, errMsg: result.errMsg})
    }
  }

  const leaveQueue = () => {
    const userId = socket.request.userId

    const result = onlineUsers.leaveMatchmakingQueue(userId)

    if (result.statusCode === 0) {
      io.to(`user:${userId}`).emit('queue:left')
    } else {
      io.to(`user:${userId}`).emit('queue:failure', {statusCode: result.statusCode, errMsg: result.errMsg})
    }
  }

  socket.on('queue:join', joinQueue)
  socket.on('queue:leave', leaveQueue)
}

module.exports = { registerMatchmakingQueueHandlers }