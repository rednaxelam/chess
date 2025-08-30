/* eslint-disable no-undef */
let baseURL
let socketURL

if (typeof process === 'undefined' || typeof process.env === 'undefined' || typeof process.env.NODE_ENV === 'undefined') {
  socketURL = undefined
  baseURL = '/api'
} else if (process.env.NODE_ENV === 'production') {
  socketURL = undefined
  baseURL = '/api'
} else if (process.env.NODE_ENV === 'test') {
  socketURL = 'http://localhost:3000'
  baseURL = 'http://localhost:3000/api'
} else {
  socketURL = 'http://localhost:3000'
  baseURL = '/api'
}
export default { baseURL, socketURL }