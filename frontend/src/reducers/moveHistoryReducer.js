import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { onlineGameStateReceived, gameStateReceived, onlineGameStateCleared } from './onlineGameReducer'
import { gameJoined, gameEnded, gameWasNotFound  } from './sharedActions'
import { reset, playMove, endAsDrawViaAgreement, whiteResigns, blackResigns } from './localGameReducer'

const moveHistorySlice  = createSlice({
  name: 'moveHistory',
  initialState: {
    localPly: null,
    onlinePly: null
  },
  reducers: {
    displayLocalPly(state, action) {
      state.localPly = action.payload
    },
    displayOnlinePly(state, action) {
      state.onlinePly = action.payload
    },
    displayActiveLocalBoard(state, action) {
      state.localPly = null
    },
    displayActiveOnlineBoard(state, action) {
      state.onlinePly = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(reset, playMove, endAsDrawViaAgreement, whiteResigns, blackResigns), (state, action) => {
        state.localPly = null
      })
      .addMatcher(isAnyOf(onlineGameStateCleared, gameJoined, gameEnded, gameWasNotFound), (state, action) => {
        state.onlinePly = null
      })
  }
})

export const { displayLocalPly, displayOnlinePly, displayActiveLocalBoard, displayActiveOnlineBoard } = moveHistorySlice.actions

export const registerMoveHistoryListeners = (listenerMiddleware) => {
  listenerMiddleware.startListening({
    actionCreator: onlineGameStateReceived,
    effect: (action, listenerApi) => {
      const savedVersion = listenerApi.getOriginalState().onlineGame?.gameState.version
      if (!savedVersion) return
      const receivedVersion = action.payload.gameState.version
      if (receivedVersion > savedVersion) listenerApi.dispatch(displayActiveOnlineBoard())
    }
  })

  listenerMiddleware.startListening({
    actionCreator: gameStateReceived,
    effect: (action, listenerApi) => {
      const savedVersion = listenerApi.getOriginalState().onlineGame?.gameState.version
      if (!savedVersion) return
      const receivedVersion = action.payload.version
      if (receivedVersion > savedVersion) listenerApi.dispatch(displayActiveOnlineBoard())
    }
  })
}

export default moveHistorySlice.reducer