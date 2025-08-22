const baseURL = process.env.NODE_ENV === 'test' ? 'http://localhost:3000/api' : '/api'

export default { baseURL }