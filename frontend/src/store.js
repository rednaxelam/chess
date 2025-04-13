import { configureStore } from '@reduxjs/toolkit'
import localGameReducer from './reducers/localGameReducer'

const store = configureStore({
  reducer: {
    localGame: localGameReducer
  }
})

export default store