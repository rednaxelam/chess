import { createSlice } from '@reduxjs/toolkit'
import { gameEnded, gameJoined } from './sharedActions'

const initialState = null

const onlineUserSlice = createSlice({
  name: 'onlineUser',
  initialState,
  reducers: {
    siteUserStateReceived(state, action) {
      return action.payload
    },
    newUsername(state, action) {
      state.username = action.payload
    },
    newGameStatus(state, action) {
      state.onlineGameStatus = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(gameJoined, (state, action) => {
        state.onlineGameStatus = 2
        state.hasOnlineGame = true
      })
      .addCase(gameEnded, (state, action) => {
        state.onlineGameStatus = 0
      })
  }
})

export const { siteUserStateReceived, newUsername, newGameStatus } = onlineUserSlice.actions

export default onlineUserSlice.reducer