import { createSlice } from '@reduxjs/toolkit'
import gameLogic from 'game-logic'

const ChessGame = gameLogic.ChessGame

const initialState = { chessGame: new ChessGame() }
initialState.currentGameState = initialState.chessGame.getCurrentGameStateRepresentation()

const localGameSlice = createSlice({
  name: 'localGame',
  initialState,
  reducers: {
    reset(state, action) {
      state.chessGame = new ChessGame()
      state.currentGameState = state.chessGame.getCurrentGameStateRepresentation()
    },
    playMove(state, action) {
      const { from, to, promoteTo } = action.payload
      state.chessGame.playMove(from, to, promoteTo)
      state.currentGameState = state.chessGame.getCurrentGameStateRepresentation()
    },
    endAsDrawViaAgreement(state, action) {
      state.chessGame.drawViaAgreement()
      state.currentGameState = state.chessGame.getCurrentGameStateRepresentation()
    },
    whiteResigns(state, action) {
      state.chessGame.whiteResigns()
      state.currentGameState = state.chessGame.getCurrentGameStateRepresentation()
    },
    blackResigns(state, action) {
      state.chessGame.blackResigns()
      state.currentGameState = state.chessGame.getCurrentGameStateRepresentation()
    }
  }
})

export const { reset, playMove, endAsDrawViaAgreement, whiteResigns, blackResigns } = localGameSlice.actions

export default localGameSlice.reducer

