const drawStateHasChanged = (drawState1, drawState2) => {
  return (
    drawState1.version !== drawState2.version
  )
}

const emitGameStateUpdate = (io, onlineGame) => {
  const usersInGame = onlineGame.getUsers()
  io.to(`user:${usersInGame.white}`).emit('game:game-state-update', onlineGame.getCurrentGameState(usersInGame.white))
  io.to(`user:${usersInGame.black}`).emit('game:game-state-update', onlineGame.getCurrentGameState(usersInGame.black))
}

const emitDrawStateUpdate = (io, onlineGame) => {
  const usersInGame = onlineGame.getUsers()
  io.to(`user:${usersInGame.white}`).emit('game:draw-state-update', onlineGame.getCurrentDrawAgreementState())
  io.to(`user:${usersInGame.black}`).emit('game:draw-state-update', onlineGame.getCurrentDrawAgreementState())
}

const emitFinalStateUpdate = (io, onlineGame, onlineUsers) => {
  const usersInGame = onlineGame.getUsers()

  const whiteUserState = { username: onlineUsers.getOnlineUserState(usersInGame.white).data.username }
  const blackUserState = { username: onlineUsers.getOnlineUserState(usersInGame.black).data.username }
  
  const whiteGameState = onlineGame.getCurrentGameState(usersInGame.white)
  const blackGameState = onlineGame.getCurrentGameState(usersInGame.black)
  const drawState = onlineGame.getCurrentDrawAgreementState()
  const userState = { white: whiteUserState, black: blackUserState}

  io.to(`user:${usersInGame.white}`).emit('game:final-state-update', { gameState: whiteGameState, drawState, userState })
  io.to(`user:${usersInGame.black}`).emit('game:final-state-update', { gameState: blackGameState, drawState, userState })
}

const getOnlineGame = (io, userId, onlineUsers) => {
  const resultGetOnlineGame = onlineUsers.getOnlineGame(userId)

  if (resultGetOnlineGame.statusCode === 6) {
    io.to(`user:${userId}`).emit('user:not-found', {usersErrCode: resultGetOnlineGame.statusCode, errMsg: resultGetOnlineGame.errMsg})
    return undefined
  } else if (resultGetOnlineGame.statusCode === 4) {
    io.to(`user:${userId}`).emit('game:not-found', {usersErrCode: resultGetOnlineGame.statusCode, errMsg: resultGetOnlineGame.errMsg})
    return undefined
  } else {
    return resultGetOnlineGame.data
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
    emitFinalStateUpdate(io, onlineGame, onlineUsers)
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
        const gameErrCode = onlineGame.getGameStateHasNotChangedReasonCode()
        if (gameErrCode === 4) {
          io.to(`user:${userId}`).emit('game:game-state-out-of-sync')
        } else {
          io.to(`user:${userId}`).emit('game:move-failure', { gameErrCode })
        }
      }
    } else {
      if (!onlineGame.isActiveGame()) {
        emitFinalStateUpdate(io, onlineGame, onlineUsers)
        onlineUsers.chessGameHasConcluded(onlineGame)
      } else {
        emitGameStateUpdate(io, onlineGame)
      }
    }
  }

  const handleDrawOperation = (operationName, drawStateVersion) => {
    const userId = socket.request.userId

    const onlineGame = getOnlineGame(io, userId, onlineUsers)
    if (!onlineGame) return

    if (!onlineGame.isActiveGame()) {
      io.to(`user:${userId}`).emit('game:finished')
      return
    }

    const drawStateBefore = onlineGame.getCurrentDrawAgreementState()

    onlineGame[operationName](userId, drawStateVersion)

    if (onlineGame.gameStateHasChanged()) {
      emitFinalStateUpdate(io, onlineGame, onlineUsers)
      onlineUsers.chessGameHasConcluded(onlineGame)
      return
    }

    const drawStateAfter = onlineGame.getCurrentDrawAgreementState()

    if (drawStateHasChanged(drawStateBefore, drawStateAfter)) {
      emitDrawStateUpdate(io, onlineGame)
    } else {
      if (onlineGame.getGameStateHasNotChangedReasonCode() === 6) {
        io.to(`user:${userId}`).emit('game:draw-state-out-of-sync')
      } else {
        io.to(`user:${userId}`).emit('game:no-draw-state-change')
      }
    }
  }

  const offerDraw = (drawStateVersion) => handleDrawOperation('playerOffersDraw', drawStateVersion)

  const resetDrawOffers = (drawStateVersion) => handleDrawOperation('playerResetsDrawAgreement', drawStateVersion)

  const doesNotWantDrawOffers = (drawStateVersion) => handleDrawOperation('playerDoesNotWantDrawOffers', drawStateVersion)

  const wantsDrawOffers = (drawStateVersion) => handleDrawOperation('playerWantsDrawOffers', drawStateVersion)

  const resign = () => handleGameTermination(io, socket, onlineUsers, 'playerResigns')

  const recoverAllOnlineGameState = () => {
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

  const recoverGameState = () => {
    const userId = socket.request.userId

    const onlineGame = getOnlineGame(io, userId, onlineUsers)
    if (!onlineGame) return

    const gameState = onlineGame.getCurrentGameState(userId)

    io.to(`user:${userId}`).emit('game:current-game-state', { ...gameState })
  }

  const recoverDrawState = () => {
    const userId = socket.request.userId

    const onlineGame = getOnlineGame(io, userId, onlineUsers)
    if (!onlineGame) return

    const drawState = onlineGame.getCurrentDrawAgreementState()

    io.to(`user:${userId}`).emit('game:current-draw-state', { ...drawState })
  }

  const checkVersionInfo = (clientVersionInfo) => {
    const userId = socket.request.userId
    
    if (clientVersionInfo === null || typeof clientVersionInfo !== 'object') {
      io.to(`user:${userId}`).emit('no:thanks')
    }
    const onlineGame = getOnlineGame(io, userId, onlineUsers)
    if (!onlineGame) return

    const versionInfo = onlineGame.getVersionInfo()
    const gameStateIsInSync = clientVersionInfo.gameState === versionInfo.gameState
    const drawStateIsInSync = clientVersionInfo.drawState === versionInfo.drawState

    if (!gameStateIsInSync && !drawStateIsInSync) {
      io.to(`user:${userId}`).emit('game:all-state-out-of-sync')
    } else if (!gameStateIsInSync) {
      io.to(`user:${userId}`).emit('game:game-state-out-of-sync')
    } else if (!drawStateIsInSync) {
      io.to(`user:${userId}`).emit('game:draw-state-out-of-sync')
    } else {
      io.to(`user:${userId}`).emit('game:is-in-sync')
    }
  }

  socket.on('game:play-move', playMove)
  socket.on('game:draw:make-offer', offerDraw)
  socket.on('game:draw:reset-offers', resetDrawOffers)
  socket.on('game:draw:no-offers', doesNotWantDrawOffers)
  socket.on('game:draw:want-offers', wantsDrawOffers)
  socket.on('game:resign', resign)
  socket.on('game:recover-state', recoverAllOnlineGameState)
  socket.on('game:recover-game-state', recoverGameState)
  socket.on('game:recover-draw-state', recoverDrawState)
  socket.on('game:check-version-info', checkVersionInfo)

  // possible emitted events:
  // game:game-state-update
  // game:draw-state-update
  // game:final-state-update
  // game:current-state
  // game:current-game-state
  // game:current-draw-state
  // game:is-in-sync
  // (error) game:not-found
  // (error) game:finished 
  // (error) game:move-failure
  // (error) game:no-draw-state-change
  // (error) game:all-state-out-of-sync
  // (error) game:game-state-out-of-sync
  // (error) game:draw-state-out-of-sync
}

module.exports = { registerOnlineGameHandlers }