import socket from '../socket'
import store from '../store'

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

export const emitPlayMove = (moveInfo, version) => {
  socket.emit('game:play-move', moveInfo, version)
}

export const emitMakeDrawOffer = (version) => {
  socket.emit('game:draw:make-offer', version)
}

export const emitResetDrawOffers = (version) => {
  socket.emit('game:draw:reset-offers', version)
}

export const emitNoDrawOffers = (version) => {
  socket.emit('game:draw:no-offers', version)
}

export const emitWantDrawOffers = (version) => {
  socket.emit('game:draw:want-offers', version)
}

export const emitResign = () => {
  socket.emit('game:resign')
}

export const emitRecoverAllOnlineGameState = () => {
  socket.emit('game:recover-state')
}

export const emitRecoverGameState = () => {
  socket.emit('game:recover-game-state')
}

export const emitRecoverDrawState = () => {
  socket.emit('game:recover-draw-state')
}

export const emitCheckVersionInfo = () => {
  const storeSnapshot = store.getState()
  const gameStateVersion = storeSnapshot.onlineGame.gameState.version
  const drawStateVersion = storeSnapshot.onlineGame.drawState.version
  socket.emit('game:check-version-info', { gameState: gameStateVersion, drawState: drawStateVersion })

}
