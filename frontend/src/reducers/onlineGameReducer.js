import { createSlice } from '@reduxjs/toolkit'

const initialState = null

const onlineGameSlice = createSlice({
  name: 'onlineGame',
  initialState,
  reducers: {
    updateAllOnlineGameState(state, action) {
      state = action.payload
    },
    clearAllOnlineGameState(state, action) {
      state = null
    },
    updateGameState(state, action) {
      state.gameState = action.payload
    },
    updateDrawState(state, action) {
      state.drawState = action.payload
    },
    updateUserState(state, action) {
      state.userState = action.payload
    }
  }
})

export const { updateAllOnlineGameState, clearAllOnlineGameState, updateGameState, updateDrawState, updateUserState } = onlineGameSlice.actions

export default onlineGameSlice.reducer

