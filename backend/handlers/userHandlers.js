const registerUserHandlers = (io, socket, onlineUsers) => {

  const handleUserOperation = (operationName, responseEventName) => {
    const userId = socket.request.userId
  
    const result = onlineUsers[operationName](userId)
  
    if (result.statusCode === 0) {
      io.to(`user:${userId}`).emit(`${responseEventName}`, result.data)
    } else {
      io.to(`user:${userId}`).emit('user:not-found', { usersErrCode: result.statusCode, errMsg: result.errMsg })
    }
  }  

  const getUserState = () => handleUserOperation('getOnlineUserState', 'user:current-state')

  const getUserGameStatus = () => handleUserOperation('getOnlineGameStatus', 'user:current-game-status')

  const generateNewName = () => handleUserOperation('generateNewRandomName', 'user:new-name')

  socket.on('user:get-user-state', getUserState)
  socket.on('user:get-game-status', getUserGameStatus)
  socket.on('user:get-new-name', generateNewName)
}

module.exports = { registerUserHandlers }