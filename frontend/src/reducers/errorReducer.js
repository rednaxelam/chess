import { createSlice } from '@reduxjs/toolkit'

const initialState = null

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    updateErrorState(state, action) {
      state = action.payload
    },
    clearErrorState(state, action) {
      state = null
    },
  }
})

export const { updateErrorState, clearErrorState } = errorSlice.actions

export default errorSlice.reducer