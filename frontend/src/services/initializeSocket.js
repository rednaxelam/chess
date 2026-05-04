import socket from '../socket'
import getGuestUserAccountToken from './guestUsers'
import store from '../store'
import { newErrorState } from '../reducers/errorReducer'
import registerSocketHandlers from './socketHandlers'
import { emitGetUserState, emitGameRecoverState } from './socketEmitters'
import config from '../utils/config'

const getInitialState = async () => {
  await new Promise(resolve => {
    const emitGameRecoverStateIfHasOnlineGame = (currentUserState) => {
      if (currentUserState.hasOnlineGame) emitGameRecoverState()
      socket.off('user:current-state', emitGameRecoverStateIfHasOnlineGame)
      resolve()
    }
    socket.on('user:current-state', emitGameRecoverStateIfHasOnlineGame)
    emitGetUserState()
  })
}

const initializeSocket = async () => {
  const intializationHasFailedFlag = false

  if (!localStorage.getItem('token')) {
    try {
      const token = await getGuestUserAccountToken()
      localStorage.setItem('token', token)
    } catch (error) {
      store.dispatch(newErrorState({ type: 'serverError', errorCode: 0, msg: 'Server has failed to create a new user' }))
    }
  }

  if (intializationHasFailedFlag) return

  registerSocketHandlers(socket)

  // the code is currently operating under the assumption that client-side tokens and the server-side secret will not be modified
  const token = localStorage.getItem('token')
  socket.io.opts.extraHeaders = { authorization: `Bearer ${token}` }
  socket.connect(`${config.socketURL}`)

  getInitialState()

}

export default initializeSocket