import axios from 'axios'
import config from '../utils/config'

const URL = `${config.baseURL}/guest-users`

const getGuestUserAccountToken = async (abortControllerSignal) => {
  try {
    let response
    if (abortControllerSignal) {
      response = await axios.post(URL, {}, {
        signal: abortControllerSignal
      })
    } else {
      response = await axios.post(URL)
    }
    return response.data.token
  } catch (error) {
    if (abortControllerSignal && abortControllerSignal.aborted) {
      error.name = 'CancelledError'
      throw error
    }
    else throw new Error('Guest user account creation was unsuccessful')
  }
}

export default getGuestUserAccountToken
