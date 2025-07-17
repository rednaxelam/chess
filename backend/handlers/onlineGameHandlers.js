const isDrawStateEqual = (drawState1, drawState2) => {
  return (
    drawState1.player.offersDraw === drawState2.player.offersDraw
    && drawState1.player.wantsDrawOffers === drawState2.player.wantsDrawOffers
    && drawState1.opponent.offersDraw === drawState2.opponent.offersDraw
    && drawState1.opponent.wantsDrawOffers === drawState2.opponent.wantsDrawOffers
  )
}

const emitGameStateUpdate = (io, onlineGame) => {
  const usersInGame = onlineGame.getUsers()
  io.to(`user:${usersInGame.white}`).emit('game:game-state-update', onlineGame.getCurrentGameState(usersInGame.white))
  io.to(`user:${usersInGame.black}`).emit('game:game-state-update', onlineGame.getCurrentGameState(usersInGame.black))
}

const emitDrawStateUpdate = (io, onlineGame) => {
  const usersInGame = onlineGame.getUsers()
  io.to(`user:${usersInGame.white}`).emit('game:draw-state-update', onlineGame.getCurrentDrawAgreementState(usersInGame.white))
  io.to(`user:${usersInGame.black}`).emit('game:draw-state-update', onlineGame.getCurrentDrawAgreementState(usersInGame.black))
}

const getOnlineGame = (io, userId, onlineUsers) => {
  const resultGetOnlineGame = onlineUsers.getOnlineGame(userId)

  if (resultGetOnlineGame.statusCode !== 0) {
    io.to(`user:${userId}`).emit('game:not-found', {usersErrCode: resultGetOnlineGame.statusCode, errMsg: resultGetOnlineGame.errMsg})
    return undefined
  } else {
    return resultGetOnlineGame.data
  }
}

const handleDrawOperation = (io, socket, onlineUsers, operationName) => {
  const userId = socket.request.userId

  const onlineGame = getOnlineGame(io, userId, onlineUsers)
  if (!onlineGame) return

  if (!onlineGame.isActiveGame()) {
    io.to(`user:${userId}`).emit('game:finished')
    return
  }

  const drawStateBefore = onlineGame.getCurrentDrawAgreementState(userId)

  onlineGame[operationName](userId)

  if (onlineGame.gameStateHasChanged()) {
    emitGameStateUpdate(io, onlineGame)
    return
  }

  const drawStateAfter = onlineGame.getCurrentDrawAgreementState(userId)

  if (!isDrawStateEqual(drawStateBefore, drawStateAfter)) {
    emitDrawStateUpdate(io, onlineGame)
  }
}

const handleGameTermination = (io, socket, onlineUsers, operationName) => {
  const userId = socket.request.userId

  const onlineGame = getOnlineGame(io, userId, onlineUsers)
  if (!onlineGame) return
  
  onlineGame[operationName](userId)

  if (!onlineGame.gameStateHasChanged()) {
    io.to(`user:${userId}`).emit('game:finished')
  } else {
    emitGameStateUpdate(io, onlineGame)
  }

}

const registerOnlineGameHandlers = (io, socket, onlineUsers) => {
  
  const playMove = (moveInfo, moveCount) => {
    const userId = socket.request.userId

    const onlineGame = getOnlineGame(io, userId, onlineUsers)
    if (!onlineGame) return

    onlineGame.playMove(userId, moveInfo, moveCount)

    if (!onlineGame.gameStateHasChanged()) {
      if (!onlineGame.isActiveGame()) {
        io.to(`user:${userId}`).emit('game:finished')
      } else {
        io.to(`user:${userId}`).emit('game:move-failure', {gameErrCode: onlineGame.getGameStateHasNotChangedReasonCode()})
      }
    } else {
      emitGameStateUpdate(io, onlineGame)
    }
  }

  const offerDraw = () => handleDrawOperation(io, socket, onlineUsers, 'playerOffersDraw')

  const resetDrawOffers = () => handleDrawOperation(io, socket, onlineUsers, 'playerResetsDrawAgreement')

  const doesNotWantDrawOffers = () => handleDrawOperation(io, socket, onlineUsers, 'playerDoesNotWantDrawOffers')

  const wantsDrawOffers = () => handleDrawOperation(io, socket, onlineUsers, 'playerWantsDrawOffers')

  const resign = () => handleGameTermination(io, socket, onlineUsers, 'playerResigns')

  const recoverOnlineGameState = () => {
    const userId = socket.request.userId

    const onlineGame = getOnlineGame(io, userId, onlineUsers)
    if (!onlineGame) return

    const gameState = onlineGame.getCurrentGameState(userId)
    const drawState = onlineGame.getCurrentDrawAgreementState(userId)

    io.to(`user:${userId}`).emit('game:current-state', { gameState, drawState })
  }

  socket.on('game:play-move', playMove)
  socket.on('game:draw:make-offer', offerDraw)
  socket.on('game:draw:reset-offers', resetDrawOffers)
  socket.on('game:draw:no-offers', doesNotWantDrawOffers)
  socket.on('game:draw:want-offers', wantsDrawOffers)
  socket.on('game:resign', resign)
  socket.on('game:recover-state', recoverOnlineGameState)

  // possible responses:
  // game:game-state-update
  // game:draw-state-update
  // game:current-state
  // (error) game:not-found
  // (error) game:finished 
  // (error) game:move-failure
}

module.exports = { registerOnlineGameHandlers }