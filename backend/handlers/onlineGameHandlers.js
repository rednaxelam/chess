const isDrawStateEqual = (drawState1, drawState2) => {
  return (
    drawState1.white.offersDraw === drawState2.white.offersDraw
    && drawState1.white.wantsDrawOffers === drawState2.white.wantsDrawOffers
    && drawState1.black.offersDraw === drawState2.black.offersDraw
    && drawState1.black.wantsDrawOffers === drawState2.black.wantsDrawOffers
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
    onlineUsers.chessGameHasConcluded(onlineGame)
    return
  }

  const drawStateAfter = onlineGame.getCurrentDrawAgreementState(userId)

  if (!isDrawStateEqual(drawStateBefore, drawStateAfter)) {
    emitDrawStateUpdate(io, onlineGame)
  } else {
    io.to(`user:${userId}`).emit('game:no-draw-state-change')
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
    onlineUsers.chessGameHasConcluded(onlineGame)
  }

}

const registerOnlineGameHandlers = (io, socket, onlineUsers) => {
  
  const playMove = (moveInfo, gameStateVersion) => {
    const userId = socket.request.userId

    const onlineGame = getOnlineGame(io, userId, onlineUsers)
    if (!onlineGame) return

    onlineGame.playMove(userId, moveInfo, gameStateVersion)

    if (!onlineGame.gameStateHasChanged()) {
      if (!onlineGame.isActiveGame()) {
        io.to(`user:${userId}`).emit('game:finished')
      } else {
        io.to(`user:${userId}`).emit('game:move-failure', { gameErrCode: onlineGame.getGameStateHasNotChangedReasonCode() })
      }
    } else {
      emitGameStateUpdate(io, onlineGame)
      if (!onlineGame.isActiveGame()) onlineUsers.chessGameHasConcluded(onlineGame)
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

    const usersInGame = onlineGame.getUsers()
    // the following assumes that users won't be removed from OnlineUsers during the course of the game
    const whiteUserState = { username: onlineUsers.getOnlineUserState(usersInGame.white).data.username }
    const blackUserState = { username: onlineUsers.getOnlineUserState(usersInGame.black).data.username }

    const gameState = onlineGame.getCurrentGameState(userId)
    const drawState = onlineGame.getCurrentDrawAgreementState()
    const userState = { white: whiteUserState, black: blackUserState}

    io.to(`user:${userId}`).emit('game:current-state', { gameState, drawState, userState })
  }

  socket.on('game:play-move', playMove)
  socket.on('game:draw:make-offer', offerDraw)
  socket.on('game:draw:reset-offers', resetDrawOffers)
  socket.on('game:draw:no-offers', doesNotWantDrawOffers)
  socket.on('game:draw:want-offers', wantsDrawOffers)
  socket.on('game:resign', resign)
  socket.on('game:recover-state', recoverOnlineGameState)

  // possible emitted events:
  // game:game-state-update
  // game:draw-state-update
  // game:current-state
  // (error) game:not-found
  // (error) game:finished 
  // (error) game:move-failure
  // (error) game:no-draw-state-change
}

module.exports = { registerOnlineGameHandlers }