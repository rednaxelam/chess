const ioc = require('socket.io-client')
const testConfig = require('../utils/config')

const USER1_TOKEN = testConfig.USER1_TOKEN
const USER1_ID = testConfig.USER1_ID
const USER2_TOKEN = testConfig.USER2_TOKEN
const USER2_ID = testConfig.USER2_ID

let server, io
let user1ClientSocket, user1ServerSocket
let user2ClientSocket, user2ServerSocket

const makeEventTracker = () => {
  let resolveEventHasHappened
  const eventHasHappened = new Promise((resolve) => { resolveEventHasHappened = resolve })
  return [resolveEventHasHappened, eventHasHappened]
}

const expectResponseToEmittedEvent = (clientSocket, emittedEventName, receivedEventName) => {
  return new Promise(resolve => {
    clientSocket.on(receivedEventName, () => {
      clientSocket.off()
      resolve()
    })
    clientSocket.emit(emittedEventName)
  })
}

describe('matchmakingQueueHandlers testing', () => {

  beforeEach((done) => {
    jest.isolateModules(() => {
      ({ server, io } = require('../app'))
      
      server.listen(() => {
        let resolveUser1HasConnected
        let resolveUser2HasConnected
        const user1HasConnected = new Promise((resolve) => { resolveUser1HasConnected = resolve })
        const user2HasConnected = new Promise((resolve) => { resolveUser2HasConnected = resolve })

        io.on('connection', (socket) => {
          const userId = socket.request.userId
          if (userId === USER1_ID) {
            user1ServerSocket = socket
          } else if (userId === USER2_ID) {
            user2ServerSocket = socket
          } else {
            throw new Error('Unrecognised userId')
          }
        })

        const port = server.address().port
        user1ClientSocket = ioc(`http://localhost:${port}`, {
          extraHeaders: { authorization: `Bearer ${USER1_TOKEN}` }
        })
        user2ClientSocket = ioc(`http://localhost:${port}`, {
          extraHeaders: { authorization: `Bearer ${USER2_TOKEN}` }
        })

        user1ClientSocket.on('connect', () => resolveUser1HasConnected())
        user2ClientSocket.on('connect', () => resolveUser2HasConnected())
        Promise.all([user1HasConnected, user2HasConnected]).then(() => done())
      })
    })
    
  })

  afterEach(() => {
    user1ClientSocket.disconnect()
    user2ClientSocket.disconnect()
    io.close()
    server.close()
  })

  test('Test server and client setup works', async () => {
    await new Promise(resolve => {
      user1ClientSocket.on('hello', (sphericalObject) => {
        expect(sphericalObject).toBe('world')
        resolve()
      })
      user1ServerSocket.emit('hello', 'world')
    })
    await new Promise(resolve => {
      user2ClientSocket.on('hello', (sphericalObject) => {
        expect(sphericalObject).toBe('world')
        resolve()
      })
      user2ServerSocket.emit('hello', 'world')
    })
  })


  test('After two users have joined the queue, they will be paired together for a game', async () => {
    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:join', 'queue:joined')

    await new Promise(resolve => {
      const [resolveUser1ReceivedGameState, user1ReceivedGameState] = makeEventTracker()
      const [resolveUser2ReceivedGameState, user2ReceivedGameState] = makeEventTracker()
      user1ClientSocket.on('game:joined', (onlineGameInfo) => {
        expect(onlineGameInfo.gameState.gameStatus).toBe(0)
        resolveUser1ReceivedGameState()
      })
      user2ClientSocket.on('game:joined', (onlineGameInfo) => {
        expect(onlineGameInfo.gameState.gameStatus).toBe(0)
        resolveUser2ReceivedGameState()
      })
      user2ClientSocket.emit('queue:join')
      Promise.all([user1ReceivedGameState, user2ReceivedGameState]).then(() => resolve())
    })
  })

  test('Users can leave and rejoin the matchmaking queue', async () => {
    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:join', 'queue:joined')

    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:leave', 'queue:left')

    await expectResponseToEmittedEvent(user2ClientSocket, 'queue:join', 'queue:joined')

    await new Promise(resolve => {
      const [resolveUser1ReceivedGameState, user1ReceivedGameState] = makeEventTracker()
      const [resolveUser2ReceivedGameState, user2ReceivedGameState] = makeEventTracker()
      user1ClientSocket.on('game:joined', (onlineGameInfo) => {
        expect(onlineGameInfo.gameState.gameStatus).toBe(0)
        resolveUser1ReceivedGameState()
      })
      user2ClientSocket.on('game:joined', (onlineGameInfo) => {
        expect(onlineGameInfo.gameState.gameStatus).toBe(0)
        resolveUser2ReceivedGameState()
      })
      user1ClientSocket.emit('queue:join')
      Promise.all([user1ReceivedGameState, user2ReceivedGameState]).then(() => resolve())
    })
    
  })

  test('If a user disconnects and has no other connections, they leave the matchmaking queue', async () => {
    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:join', 'queue:joined')

    await new Promise(resolve => {
      user1ServerSocket.on('disconnect', () => resolve())
      user1ClientSocket.disconnect()
    })

    await expectResponseToEmittedEvent(user2ClientSocket, 'queue:join', 'queue:joined')
  })

  test('If a user is already in a game or the matchmaking queue, they are not able to join (or join again) the queue', async () => {
    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:join', 'queue:joined')

    await new Promise(resolve => {
      user1ClientSocket.on('queue:failure', (error) => {
        expect(error.usersErrCode).toBe(1)
        user1ClientSocket.off()
        resolve()
      })
      user1ClientSocket.emit('queue:join')
    })

    await expectResponseToEmittedEvent(user2ClientSocket, 'queue:join', 'game:joined')

    await new Promise(resolve => {
      user1ClientSocket.on('queue:failure', (error) => {
        expect(error.usersErrCode).toBe(2)
        user1ClientSocket.off()
        resolve()
      })
      user1ClientSocket.emit('queue:join')
    })
  })

  test('After the completion of a game, the queue can be joined again', async () => {
    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:join', 'queue:joined')
    await expectResponseToEmittedEvent(user2ClientSocket, 'queue:join', 'game:joined')

    await expectResponseToEmittedEvent(user1ClientSocket, 'game:resign', 'game:game-state-update')

    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:join', 'queue:joined')
    await expectResponseToEmittedEvent(user2ClientSocket, 'queue:join', 'game:joined')
  })

  test('If in a game or idle, attempting to leave the matchmaking queue will lead to an error', async () => {
    await new Promise(resolve => {
      user1ClientSocket.on('queue:failure', (error) => {
        expect(error.usersErrCode).toBe(3)
        user1ClientSocket.off()
        resolve()
      })
      user1ClientSocket.emit('queue:leave')
    })

    await expectResponseToEmittedEvent(user1ClientSocket, 'queue:join', 'queue:joined')
    await expectResponseToEmittedEvent(user2ClientSocket, 'queue:join', 'game:joined')

    await new Promise(resolve => {
      user2ClientSocket.on('queue:failure', (error) => {
        expect(error.usersErrCode).toBe(2)
        user1ClientSocket.off()
        resolve()
      })
      user2ClientSocket.emit('queue:leave')
    })
  })

})