import store from '../store'
import { onlineGameStateReceived,
  onlineGameStateCleared,
  gameStateReceived,
  drawStateReceived,
  gameUserStateReceived, } from '../reducers/onlineGameReducer'
import { siteUserStateReceived,
  newUsername,
  newGameStatus, } from '../reducers/onlineUserReducer'
import { newErrorState,
  errorStateCleared } from '../reducers/errorReducer'
import { gameJoined, gameEnded } from '../reducers/sharedActions'
import { emitGetUserState, emitGameRecoverState } from '../services/socketEmitters'

const registerSocketHandlers = socket => {

  const getAllCurrentOnlineState = async () => {
    await new Promise(resolve => {
      const emitGameRecoverStateIfHasOnlineGame = (currentUserState) => {
        if (currentUserState.hasOnlineGame) emitGameRecoverState()
        socket.off('user:current-state', emitGameRecoverStateIfHasOnlineGame)
        resolve()
      }
      socket.on('user:current-state', emitGameRecoverStateIfHasOnlineGame)
      emitGetUserState()
    })
  }

  // the following line will run after the initial connection and after every time it reconnects
  socket.on('connect', getAllCurrentOnlineState)
  // the following line is for development
  socket.onAny((event, ...args) => {console.log(`got ${event}`); console.log(`args ${JSON.stringify(args)}`)})

  socket.on('user:current-state', (currentUserState) => store.dispatch(siteUserStateReceived(currentUserState)))
  socket.on('user:current-game-status', (userOnlineGameStatus) => store.dispatch(newGameStatus(userOnlineGameStatus)))
  socket.on('user:new-name', (username) => store.dispatch(newUsername(username)))
  socket.on('user:not-found', () => store.dispatch(newErrorState({ type: 'usersError', errorCode: 6 })))

  socket.on('queue:joined', () => store.dispatch(newGameStatus(1)))
  socket.on('queue:left', () => store.dispatch(newGameStatus(0)))
  socket.on('queue:failure', (userErrorInfo) => store.dispatch(newErrorState({ type: 'usersError', errorCode: userErrorInfo.usersErrCode })))

  socket.on('game:joined', (onlineGameState) => store.dispatch(gameJoined(onlineGameState)))
  socket.on('game:final-state-update', (onlineGameState) => store.dispatch(gameEnded(onlineGameState)))
  socket.on('game:current-state', (onlineGameState) => store.dispatch(onlineGameStateReceived(onlineGameState)))
  socket.on('game:game-state-update', (gameState) => store.dispatch(gameStateReceived(gameState)))
  socket.on('game:draw-state-update', (drawState) => store.dispatch(drawStateReceived(drawState)))
  socket.on('game:not-found', () => store.dispatch(newErrorState({ type: 'usersError', errorCode: 4 })))
  socket.on('game:finished', () => store.dispatch(newErrorState({ type: 'gameError', errorCode: 5 })))
  socket.on('game:move-failure', (gameErrorInfo) => store.dispatch(newErrorState({ type: 'gameError', errorCode: gameErrorInfo.gameErrCode })))
  socket.on('game:no-draw-state-change', () => store.dispatch(newErrorState({ type: 'gameError', errorCode: 3 })))
}

export default registerSocketHandlers