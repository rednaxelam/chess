import { createSlice } from '@reduxjs/toolkit'
import { gameEnded, gameJoined, gameWasNotFound } from './sharedActions'
import { siteUserStateReceived } from './onlineUserReducer'

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
      if (state.gameState.version < action.payload.version) {
        state.gameState = action.payload
      }
    },
    drawStateReceived(state, action) {
      if (state.drawState.version < action.payload.version) {
        state.drawState = action.payload
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
      .addCase(gameEnded, (state, action) => {
        return action.payload
      })
      .addCase(gameWasNotFound, (state, action) => {
        return null
      })
      .addCase(siteUserStateReceived, (state, action) => {
        if (!action.payload.hasOnlineGame) return null
      })
  }
})

export const { onlineGameStateReceived, onlineGameStateCleared, gameStateReceived, drawStateReceived, gameUserStateReceived } = onlineGameSlice.actions

export default onlineGameSlice.reducer

