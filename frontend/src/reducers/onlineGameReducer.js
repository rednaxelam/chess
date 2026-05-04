import { createSlice } from '@reduxjs/toolkit'
import { gameJoined } from './sharedActions'

const initialState = null

const onlineGameSlice = createSlice({
  name: 'onlineGame',
  initialState,
  reducers: {
    onlineGameStateReceived(state, action) {
      if (!state) return action.payload
      if (state.gameState.version < action.payload.gameState.version) {
        state.gameState = action.payload.gameState
      }

      if (state.drawState.version < action.payload.drawState.version) {
        state.drawState = action.payload.drawState
      }

      state.userState = action.payload.userState
    },
    onlineGameStateCleared(state, action) {
      return null
    },
    gameStateReceived(state, action) {
      if (state.gameState.version < action.payload.gameState.version) {
        state.gameState = action.payload.gameState
      }
    },
    drawStateReceived(state, action) {
      if (state.drawState.version < action.payload.drawState.version) {
        state.drawState = action.payload.drawState
      }
    },
    gameUserStateReceived(state, action) {
      state.userState = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(gameJoined, (state, action) => {
        return action.payload
      })
  }
})

export const { onlineGameStateReceived, onlineGameStateCleared, gameStateReceived, drawStateReceived, gameUserStateReceived } = onlineGameSlice.actions

export default onlineGameSlice.reducer

