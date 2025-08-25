/* eslint-disable no-undef */
import getGuestUserAccountToken from '../services/guestUsers'

test('getGuestUserAccountToken returns a token that the user can use to set up a WebSocket connection', async () => {
  const token = await getGuestUserAccountToken()
  expect((typeof token) === 'string').toBe(true)
})