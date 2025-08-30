import store from '../store'
import { updateAllOnlineGameState,
  clearAllOnlineGameState,
  updateGameState,
  updateDrawState,
  updateUserState } from '../reducers/onlineGameReducer'
import { updateAllOnlineUserState,
  updateOnlineUserUsername,
  updateOnlineUserOnlineGameStatus } from '../reducers/onlineUserReducer'



const registerSocketHandlers = socket => {
  socket.on('user:current-state', (currentUserState) => store.dispatch(updateAllOnlineUserState(currentUserState)))
  socket.on('user:current-game-status', (userOnlineGameStatus) => store.dispatch(updateOnlineUserOnlineGameStatus(userOnlineGameStatus)))
  socket.on('user:new-name', (newUsername) => store.dispatch(updateOnlineUserUsername(newUsername)))

  socket.on('queue:joined', () => store.dispatch(updateOnlineUserOnlineGameStatus(1)))
  socket.on('queue:left', () => store.dispatch(updateOnlineUserOnlineGameStatus(0)))

  socket.on('game:joined', (onlineGameState) => store.dispatch(updateAllOnlineGameState(onlineGameState)))
  socket.on('game:current-state', (onlineGameState) => store.dispatch(updateAllOnlineGameState(onlineGameState)))
  socket.on('game:game-state-update', (gameState) => store.dispatch(updateGameState(gameState)))
  socket.on('game:draw-state-update', (drawState) => store.dispatch(updateDrawState(drawState)))
}

export default registerSocketHandlers