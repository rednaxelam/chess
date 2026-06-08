import socket from '../socket'
import getGuestUserAccountToken from './guestUsers'
import store from '../store'
import { newErrorState } from '../reducers/errorReducer'
import registerSocketHandlers from './socketHandlers'
import config from '../utils/config'

const initializeSocket = async (abortControllerSignal) => {
  // the abortController argument is optional
  let intializationHasFailedFlag = false

  if (!localStorage.getItem('token')) {
    try {
      const token = await getGuestUserAccountToken(abortControllerSignal)
      localStorage.setItem('token', token)
    } catch (error) {
      intializationHasFailedFlag = true
      if (error.name === 'CancelledError') {
        // do nothing
      } else {
        store.dispatch(newErrorState({ type: 'serverError', errorCode: 0, msg: 'Server has failed to create a new user' }))
      }
    }
  }

  if (intializationHasFailedFlag) return

  registerSocketHandlers(socket)

  // the code is currently operating under the assumption that client-side tokens and the server-side secret will not be modified
  const token = localStorage.getItem('token')
  socket.io.opts.extraHeaders = { authorization: `Bearer ${token}` }
  socket.connect(`${config.socketURL}`)

}

export default initializeSocket