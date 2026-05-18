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
import { gameJoined, gameEnded, gameWasNotFound } from '../reducers/sharedActions'
import { emitGetUserState,
  emitRecoverAllOnlineGameState,
  emitRecoverGameState,
  emitRecoverDrawState, } from '../services/socketEmitters'

const registerSocketHandlers = socket => {

  const getAllCurrentOnlineState = async () => {
    await new Promise(resolve => {
      const emitGameRecoverStateIfHasOnlineGame = (currentUserState) => {
        if (currentUserState.hasOnlineGame) emitRecoverAllOnlineGameState()
        socket.off('user:current-state', emitGameRecoverStateIfHasOnlineGame)
        socket.off('user:not-found', resolveIfUserNotFound)
        resolve()
      }
      // the user:not-found event will be handled appropriately by its other handler in the file
      const resolveIfUserNotFound = () => {
        socket.off('user:current-state', emitGameRecoverStateIfHasOnlineGame)
        socket.off('user:not-found', resolveIfUserNotFound)
        resolve()
      }
      socket.on('user:current-state', emitGameRecoverStateIfHasOnlineGame)
      socket.on('user:not-found', resolveIfUserNotFound)
      emitGetUserState()
    })
  }

  const getAllCurrentOnlineStateAndDispatchError = (error) => {
    store.dispatch(newErrorState(error))
    getAllCurrentOnlineState()
  }

  const getOnlineGameStateAndDispatchError = (error) => {
    store.dispatch(newErrorState(error))
    emitRecoverAllOnlineGameState()
  }

  const getGameStateAndDispatchError = (error) => {
    store.dispatch(newErrorState(error))
    emitRecoverGameState()
  }

  const getDrawStateAndDispatchError = (error) => {
    store.dispatch(newErrorState(error))
    emitRecoverDrawState()
  }

  const getUserStateAndDispatchGameWasNotFound = () => {
    store.dispatch(gameWasNotFound())
    emitGetUserState()
  }

  // the following line will run after the initial connection and after every time the socket reconnects
  socket.on('connect', getAllCurrentOnlineState)
  // the following line is for development
  socket.onAny((event, ...args) => {console.log(`got ${event}`); console.log(`args ${JSON.stringify(args)}`)})

  socket.on('user:current-state', (currentUserState) => store.dispatch(siteUserStateReceived(currentUserState)))
  socket.on('user:current-game-status', (userOnlineGameStatus) => store.dispatch(newGameStatus(userOnlineGameStatus)))
  socket.on('user:new-name', (username) => store.dispatch(newUsername(username)))

  socket.on('queue:joined', () => store.dispatch(newGameStatus(1)))
  socket.on('queue:left', () => store.dispatch(newGameStatus(0)))

  socket.on('game:joined', (onlineGameState) => store.dispatch(gameJoined(onlineGameState)))
  socket.on('game:final-state-update', (onlineGameState) => store.dispatch(gameEnded(onlineGameState)))
  socket.on('game:current-state', (onlineGameState) => store.dispatch(onlineGameStateReceived(onlineGameState)))
  socket.on('game:current-game-state', (gameState) => store.dispatch(gameStateReceived(gameState)))
  socket.on('game:current-draw-state', (drawState) => store.dispatch(drawStateReceived(drawState)))
  socket.on('game:game-state-update', (gameState) => store.dispatch(gameStateReceived(gameState)))
  socket.on('game:draw-state-update', (drawState) => store.dispatch(drawStateReceived(drawState)))
  socket.on('game:is-in-sync', () => {/*do nothing*/})

  // error handlers
  socket.on('user:not-found', () => store.dispatch(newErrorState({ type: 'usersError', errorCode: 6 })))
  // queue:error is the only event where userError codes 1, 2, 3, and 5 can be received
  socket.on('queue:failure', (userErrorInfo) => getAllCurrentOnlineStateAndDispatchError({ type: 'usersError', errorCode: userErrorInfo.usersErrCode }))
  // out-of-turn corresponds to gameError codes 0 and 1 on the server. A client will only be able to cause error 0 if white and 1 if black
  socket.on('game:out-of-turn', () => getGameStateAndDispatchError({ type: 'gameError', errorCode: 0 }))
  socket.on('game:invalid-move', () => store.dispatch(newErrorState({ type: 'gameError', errorCode: 2 })))
  socket.on('game:no-draw-state-change', () => store.dispatch(newErrorState({ type: 'gameError', errorCode: 3 })))
  // there is no corresponding error code for all state being out of sync with the way that OnlineGame is currently set up
  socket.on('game:all-state-out-of-sync', () => getOnlineGameStateAndDispatchError({ type: 'gameError', errorCode: 100 }))
  socket.on('game:game-state-out-of-sync', () => getGameStateAndDispatchError({ type: 'gameError', errorCode: 4 }))
  socket.on('game:draw-state-out-of-sync', () => getDrawStateAndDispatchError({ type: 'gameError', errorCode: 6 }))
  socket.on('game:not-found', getUserStateAndDispatchGameWasNotFound)
  socket.on('game:finished', () => getAllCurrentOnlineStateAndDispatchError({ type: 'gameError', errorCode: 5 }))
}

export default registerSocketHandlers