import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { gameJoined, gameWasNotFound } from './sharedActions'
import { onlineGameStateReceived } from './onlineGameReducer'

const initialState = null

const gameChatSlice = createSlice({
  name: 'gameChat',
  initialState,
  reducers: {
    chatMessageReceived(state, action) {
      if (state === null) return
      else if (state.length > action.payload.id) return
      else state.push(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(gameWasNotFound, (state, action) => {
        return null
      })
      .addMatcher(isAnyOf(gameJoined, onlineGameStateReceived), (state, action) => {
        return action.payload.chatState
      })
  }
})

export const { chatMessageReceived } = gameChatSlice.actions

export default gameChatSlice.reducer