const ioc = require('socket.io-client')
const testConfig = require('../utils/config')

const USER1_TOKEN = testConfig.USER1_TOKEN

let server, io
let user1ClientSocket, user1ServerSocket

describe('userHandlers testing', () => {

  beforeEach((done) => {
    jest.isolateModules(() => {
      ({ server, io } = require('../app'))
      server.listen(() => {
        const port = server.address().port
        user1ClientSocket = ioc(`http://localhost:${port}`, {
          extraHeaders: { authorization: `Bearer ${USER1_TOKEN}` }
        })
        io.on('connection', (socket) => {
          user1ServerSocket = socket
        })
        user1ClientSocket.on('connect', done)
      })
    })
    
  })

  afterEach(() => {
    user1ClientSocket.disconnect()
    io.close()
    server.close()
  })

  test('Test server and client setup works', (done) => {
    user1ClientSocket.on('hello', (sphericalObject) => {
      expect(sphericalObject).toBe('world')
      done()
    })
    user1ServerSocket.emit('hello', 'world')
  })

  test('Users can get their current user state by emitting user:get-user-state', (done) => {
    user1ClientSocket.on('user:current-state', (userState) => {
      expect(userState.onlineGameStatus).toBe(0)
      expect(userState.hasOnlineGame).toBe(false)
      expect(userState.numConnections).toBe(1)
      expect((typeof userState.username) === 'string').toBe(true)
      done()
    })

    user1ClientSocket.emit('user:get-user-state')
  })

  test('Users can get their current online game status by emitting user:get-game-status', (done) => {
    user1ClientSocket.on('user:current-game-status', (onlineGameStatus) => {
      expect(onlineGameStatus).toBe(0)
      done()
    })

    user1ClientSocket.emit('user:get-game-status')
  })

  test('Users can change their username by emitting user:get-new-name', (done) => {
    user1ClientSocket.on('user:new-name', (newName) => {
      expect((typeof newName) === 'string').toBe(true)
      done()
    })

    user1ClientSocket.emit('user:get-new-name')
  })

})