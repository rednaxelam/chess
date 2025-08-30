import { createSlice } from '@reduxjs/toolkit'

const initialState = null

const onlineUserSlice = createSlice({
  name: 'onlineUser',
  initialState,
  reducers: {
    updateAllOnlineUserState(state, action) {
      state = action.payload
    },
    updateOnlineUserUsername(state, action) {
      state.username = action.payload
    },
    updateOnlineUserOnlineGameStatus(state, action) {
      state.onlineGameStatus = action.payload
    },
  }
})

export const { updateAllOnlineUserState, updateOnlineUserUsername, updateOnlineUserOnlineGameStatus } = onlineUserSlice.actions

export default onlineUserSlice.reducer