const registerMatchmakingQueueHandlers = (io, socket, onlineUsers) => {

  const joinQueue = () => {
    const userId = socket.request.userId
    
    const result = onlineUsers.joinMatchmakingQueue(userId)

    if (result.statusCode === 0) {
      if (result.data.length === 0) {
        io.to(`user:${userId}`).emit('queue:joined')
      } else {
        const onlineGame = onlineUsers.getOnlineGame(userId).data
        const usersInGame = onlineGame.getUsers()

        const whiteUserState = { username: onlineUsers.getOnlineUserState(usersInGame.white).data.username }
        const blackUserState = { username: onlineUsers.getOnlineUserState(usersInGame.black).data.username }

        const whiteGameState = onlineGame.getCurrentGameState(usersInGame.white)
        const blackGameState = onlineGame.getCurrentGameState(usersInGame.black)
        const drawState = onlineGame.getCurrentDrawAgreementState()
        const userState = { white: whiteUserState, black: blackUserState}
        
        io.to(`user:${usersInGame.white}`).emit('game:joined', { gameState: whiteGameState, drawState, userState })
        io.to(`user:${usersInGame.black}`).emit('game:joined', { gameState: blackGameState, drawState, userState })
      }
    } else {
      io.to(`user:${userId}`).emit('queue:failure', {usersErrCode: result.statusCode, errMsg: result.errMsg})
    }
  }

  const leaveQueue = () => {
    const userId = socket.request.userId

    const result = onlineUsers.leaveMatchmakingQueue(userId)

    if (result.statusCode === 0) {
      io.to(`user:${userId}`).emit('queue:left')
    } else {
      io.to(`user:${userId}`).emit('queue:failure', {usersErrCode: result.statusCode, errMsg: result.errMsg})
    }
  }

  socket.on('queue:join', joinQueue)
  socket.on('queue:leave', leaveQueue)
}

module.exports = { registerMatchmakingQueueHandlers }