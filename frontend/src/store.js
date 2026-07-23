import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import localGameReducer from './reducers/localGameReducer'
import onlineGameReducer from './reducers/onlineGameReducer'
import onlineUserReducer from './reducers/onlineUserReducer'
import moveHistoryReducer from './reducers/moveHistoryReducer'
import errorReducer from './reducers/errorReducer'

import { registerMoveHistoryListeners } from './reducers/moveHistoryReducer'

const listenerMiddleware = createListenerMiddleware()

registerMoveHistoryListeners(listenerMiddleware)

const store = configureStore({
  reducer: {
    localGame: localGameReducer,
    onlineGame: onlineGameReducer,
    onlineUser: onlineUserReducer,
    moveHistory: moveHistoryReducer,
    error: errorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['localGame.chessGame']
      }
    }).prepend(listenerMiddleware.middleware)
})

export default store