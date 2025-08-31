import { configureStore } from '@reduxjs/toolkit'
import localGameReducer from './reducers/localGameReducer'
import onlineGameReducer from './reducers/onlineGameReducer'
import onlineUserReducer from './reducers/onlineUserReducer'
import errorReducer from './reducers/errorReducer'

const store = configureStore({
  reducer: {
    localGame: localGameReducer,
    onlineGame: onlineGameReducer,
    onlineUser: onlineUserReducer,
    error: errorReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['localGame.chessGame']
      }
    })
})

export default store