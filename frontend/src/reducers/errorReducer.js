import { createSlice } from '@reduxjs/toolkit'
import { gameWasNotFound } from './sharedActions'

const initialState = null

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    newErrorState(state, action) {
      return action.payload
    },
    errorStateCleared(state, action) {
      state = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(gameWasNotFound, (state, action) => {
        return { type: 'usersError', errorCode: 4 }
      })
  }
})

export const { newErrorState, errorStateCleared } = errorSlice.actions

export default errorSlice.reducer