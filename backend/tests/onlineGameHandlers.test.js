const ioc = require('socket.io-client')
const testConfig = require('../utils/config')

const USER1_TOKEN = testConfig.USER1_TOKEN
const USER1_ID = testConfig.USER1_ID
const USER2_TOKEN = testConfig.USER2_TOKEN
const USER2_ID = testConfig.USER2_ID

let server, io
let whiteClientSocket, whiteServerSocket
let blackClientSocket, blackServerSocket

const makeEventTracker = () => {
  let resolveEventHasHappened
  const eventHasHappened = new Promise((resolve) => { resolveEventHasHappened = resolve })
  return [resolveEventHasHappened, eventHasHappened]
}

const expectGameStateUpdatesAfterValidMove = (activePlayerClientSocket, moveInfo, moveCount) => {
  return new Promise(resolve => {
    const [resolveWhiteReceivedGameStateUpdate, whiteReceivedGameStateUpdate] = makeEventTracker()
    const [resolveBlackReceivedGameStateUpdate, blackReceivedGameStateUpdate] = makeEventTracker()
    whiteClientSocket.on('game:game-state-update', () => {
      whiteClientSocket.off()
      resolveWhiteReceivedGameStateUpdate()
    })
    blackClientSocket.on('game:game-state-update', () => {
      blackClientSocket.off()
      resolveBlackReceivedGameStateUpdate()
    })
    activePlayerClientSocket.emit('game:play-move', moveInfo, moveCount)
    Promise.all([whiteReceivedGameStateUpdate, blackReceivedGameStateUpdate]).then(() => resolve())
  })
}

// when a game has finished, the game:play-move handler will respond with game:finished as opposed to game:move-failure
const expectMoveFailureAfterInvalidMove = (clientSocket, moveInfo, moveCount, expectedGameErrCode) => {
  return new Promise(resolve => {
    clientSocket.on('game:move-failure', (errInfo) => {
      expect(errInfo.gameErrCode).toBe(expectedGameErrCode)
      clientSocket.off()
      resolve()
    })
    clientSocket.emit('game:play-move', moveInfo, moveCount)
  })
}

const assignSocketsByPlayerColor = (onlineGameInfo, clientSocket, serverSocket) => {
  if (onlineGameInfo.gameState.playerColor === 'white') {
    whiteClientSocket = clientSocket
    whiteServerSocket = serverSocket
  } else {
    blackClientSocket = clientSocket
    blackServerSocket = serverSocket
  }
}

describe('onlineGameHandlers testing', () => {

  beforeEach((done) => {
    jest.isolateModules(() => {
      ({ server, io } = require('../app'))
      
      server.listen(() => {
        const [resolveUser1HasJoinedOnlineGame, user1HasJoinedOnlineGame] = makeEventTracker()
        const [resolveUser2HasJoinedOnlineGame, user2HasJoinedOnlineGame] = makeEventTracker()

        let user1ServerSocket, user2ServerSocket
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
        const user1ClientSocket = ioc(`http://localhost:${port}`, {
          extraHeaders: { authorization: `Bearer ${USER1_TOKEN}` }
        })
        const user2ClientSocket = ioc(`http://localhost:${port}`, {
          extraHeaders: { authorization: `Bearer ${USER2_TOKEN}` }
        })

        user1ClientSocket.on('game:joined', (onlineGameInfo) => {
          assignSocketsByPlayerColor(onlineGameInfo, user1ClientSocket, user1ServerSocket)
          user1ClientSocket.off()
          resolveUser1HasJoinedOnlineGame()
        })
        user2ClientSocket.on('game:joined', (onlineGameInfo) => {
          assignSocketsByPlayerColor(onlineGameInfo, user2ClientSocket, user2ServerSocket)
          user2ClientSocket.off()
          resolveUser2HasJoinedOnlineGame()
        })

        user1ClientSocket.on('connect', () => user1ClientSocket.emit('queue:join'))
        user2ClientSocket.on('connect', () => user2ClientSocket.emit('queue:join'))

        
        Promise.all([user1HasJoinedOnlineGame, user2HasJoinedOnlineGame]).then(() => done())
      })
    })
    
  })

  afterEach(() => {
    whiteClientSocket.disconnect()
    blackClientSocket.disconnect()
    io.close()
    server.close()
  })

  test('Test server and client setup works', async () => {
    await new Promise(resolve => {
      whiteClientSocket.on('game:current-state', (onlineGameInfo) => {
        expect(onlineGameInfo.gameState.playerColor).toBe('white')
        resolve()
      })
      whiteClientSocket.emit('game:recover-state')
    })
    await new Promise(resolve => {
      blackClientSocket.on('game:current-state', (onlineGameInfo) => {
        expect(onlineGameInfo.gameState.playerColor).toBe('black')
        resolve()
      })
      blackClientSocket.emit('game:recover-state')
    })
  })

  describe('When in an active game', () => {
    describe('and attempting to play moves', () => {
      test('Game can be played by white and black supplying valid moves when it is their turn to move', async () => {
        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)
        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 1], to: [2, 2]}, 2)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 5], to: [4, 5]}, 3)
        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 3], to: [4, 7]}, 4)

        await new Promise(resolve => {
          whiteClientSocket.on('user:current-game-status', (onlineGameStatus) => {
            expect(onlineGameStatus).toBe(0)
            resolve()
          })
          whiteClientSocket.emit('user:get-game-status')
        })

        await new Promise(resolve => {
          whiteClientSocket.on('game:current-state', (onlineGameInfo) => {
            expect(onlineGameInfo.gameState.gameStatus).toBe(4)
            resolve()
          })
          whiteClientSocket.emit('game:recover-state')
        })
      })

      test('Attempting to supply a move for the opponent leads to no change of the board and appropriate status code response', async () => {
        await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 4], to: [3, 4]}, 0, 1)

        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)

        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [6, 6], to: [4, 6]}, 1, 0)

        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [6, 5], to: [4, 5]}, 1, 0)
      })

      test('Attempting to supply an invalid move leads to no change of the board and appropiate status code response', async () => {
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [4, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: '[1, 4]', to: [3, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: {to: [3, 4]}}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: null}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: 1, to: [3, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [1, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [2, 4], to: [3, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [6, 4], to: [4, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4, 1], to: [3, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1], to: [3, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [], to: [3, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: ['3', 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [8, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [3.1, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, null, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, undefined, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, new Date(':)'), 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4]}, 0, 2)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {to: [3, 4]}, 0, 2)

        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)

        await expectMoveFailureAfterInvalidMove(blackClientSocket, [null, null], 1, 2)
      })

      test('Attempting to move with an invalid move count leads to no change of the board and appropriate status code response', async () => {
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, null, 4)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, undefined, 4)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, '0', 4)
        await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, {0: 0}, 4)

        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)

        await expectMoveFailureAfterInvalidMove(blackClientSocket, [null, null], '1', 4)
      })
    })

  })

})