import store from '../store'
import { updateAllOnlineGameState,
  clearAllOnlineGameState,
  updateGameState,
  updateDrawState,
  updateUserState } from '../reducers/onlineGameReducer'
import { updateAllOnlineUserState,
  updateOnlineUserUsername,
  updateOnlineUserOnlineGameStatus } from '../reducers/onlineUserReducer'
import { updateErrorState,
  clearErrorState } from '../reducers/errorReducer'

const registerSocketHandlers = socket => {
  socket.on('user:current-state', (currentUserState) => store.dispatch(updateAllOnlineUserState(currentUserState)))
  socket.on('user:current-game-status', (userOnlineGameStatus) => store.dispatch(updateOnlineUserOnlineGameStatus(userOnlineGameStatus)))
  socket.on('user:new-name', (newUsername) => store.dispatch(updateOnlineUserUsername(newUsername)))
  socket.on('user:not-found', () => store.dispatch(updateErrorState({ type: 'usersError', errorCode: 6 })))

  socket.on('queue:joined', () => store.dispatch(updateOnlineUserOnlineGameStatus(1)))
  socket.on('queue:left', () => store.dispatch(updateOnlineUserOnlineGameStatus(0)))
  socket.on('queue:failure', (userErrorInfo) => store.dispatch(updateErrorState({ type: 'usersError', errorCode: userErrorInfo.usersErrCode })))

  socket.on('game:joined', (onlineGameState) => store.dispatch(updateAllOnlineGameState(onlineGameState)))
  socket.on('game:current-state', (onlineGameState) => store.dispatch(updateAllOnlineGameState(onlineGameState)))
  socket.on('game:game-state-update', (gameState) => store.dispatch(updateGameState(gameState)))
  socket.on('game:draw-state-update', (drawState) => store.dispatch(updateDrawState(drawState)))
  socket.on('game:not-found', () => store.dispatch(updateErrorState({ type: 'usersError', errorCode: 4 })))
  socket.on('game:finished ', () => store.dispatch(updateErrorState({ type: 'gameError', errorCode: 5 })))
  socket.on('game:move-failure', (gameErrorInfo) => store.dispatch(updateErrorState({ type: 'gameError', errorCode: gameErrorInfo.gameErrCode })))
  socket.on('game:no-draw-state-change', () => store.dispatch(updateErrorState({ type: 'gameError', errorCode: 3 })))
}

export default registerSocketHandlers