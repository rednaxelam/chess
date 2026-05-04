import { createSlice } from '@reduxjs/toolkit'

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
  }
})

export const { newErrorState, errorStateCleared } = errorSlice.actions

export default errorSlice.reducer