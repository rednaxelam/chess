import axios from 'axios'
import config from '../utils/config'

const URL = `${config.baseURL}/guest-users`

const getGuestUserAccountToken = async () => {
  try {
    const response = await axios.post(URL)
    return response.data.token
  } catch (error) {
    throw new Error('Guest user account creation was unsuccessful')
  }
}

export default getGuestUserAccountToken
