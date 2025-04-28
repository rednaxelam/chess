import { configureStore } from '@reduxjs/toolkit'
import localGameReducer from './reducers/localGameReducer'

const store = configureStore({
  reducer: {
    localGame: localGameReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['localGame.chessGame']
      }
    })
})

export default store