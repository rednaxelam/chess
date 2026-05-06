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

const expectFinalStateUpdatesAfterValidMove = (activePlayerClientSocket, moveInfo, moveCount) => {
  return new Promise(resolve => {
    const [resolveWhiteReceivedFinalStateUpdate, whiteReceivedFinalStateUpdate] = makeEventTracker()
    const [resolveBlackReceivedFinalStateUpdate, blackReceivedFinalStateUpdate] = makeEventTracker()
    whiteClientSocket.on('game:final-state-update', () => {
      whiteClientSocket.off()
      resolveWhiteReceivedFinalStateUpdate()
    })
    blackClientSocket.on('game:final-state-update', () => {
      blackClientSocket.off()
      resolveBlackReceivedFinalStateUpdate()
    })
    activePlayerClientSocket.emit('game:play-move', moveInfo, moveCount)
    Promise.all([whiteReceivedFinalStateUpdate, blackReceivedFinalStateUpdate]).then(() => resolve())
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

const expectGameStateOutOfSyncAfterMove = (clientSocket, moveInfo, moveCount) => {
  return new Promise(resolve => {
    clientSocket.on('game:game-state-out-of-sync', () => {
      clientSocket.off()
      resolve()
    })
    clientSocket.emit('game:play-move', moveInfo, moveCount)
  })
}

const expectDrawStateUpdatesAfterDrawEvent = (activePlayerClientSocket, drawEvent, drawStateVersion) => {
  return new Promise(resolve => {
    const [resolveWhiteReceivedDrawStateUpdate, whiteReceivedDrawStateUpdate] = makeEventTracker()
    const [resolveBlackReceivedDrawStateUpdate, blackReceivedDrawStateUpdate] = makeEventTracker()
    whiteClientSocket.on('game:draw-state-update', () => {
      whiteClientSocket.off()
      resolveWhiteReceivedDrawStateUpdate()
    })
    blackClientSocket.on('game:draw-state-update', () => {
      blackClientSocket.off()
      resolveBlackReceivedDrawStateUpdate()
    })
    activePlayerClientSocket.emit(`game:draw:${drawEvent}`, drawStateVersion)
    Promise.all([whiteReceivedDrawStateUpdate, blackReceivedDrawStateUpdate]).then(() => resolve())
  })
}

const expectGameConclusionAfterDrawEvent = (activePlayerClientSocket, drawEvent, drawStateVersion) => {
  return new Promise(resolve => {
    const [resolveWhiteReceivedFinalStateUpdate, whiteReceivedFinalStateUpdate] = makeEventTracker()
    const [resolveBlackReceivedFinalStateUpdate, blackReceivedFinalStateUpdate] = makeEventTracker()
    whiteClientSocket.on('game:final-state-update', (finalState) => {
      expect(finalState.gameState.gameStatus).toBe(12)
      whiteClientSocket.off()
      resolveWhiteReceivedFinalStateUpdate()
    })
    blackClientSocket.on('game:final-state-update', (finalState) => {
      expect(finalState.gameState.gameStatus).toBe(12)
      blackClientSocket.off()
      resolveBlackReceivedFinalStateUpdate()
    })
    activePlayerClientSocket.emit(`game:draw:${drawEvent}`, drawStateVersion)
    Promise.all([whiteReceivedFinalStateUpdate, blackReceivedFinalStateUpdate]).then(() => resolve())
  })
}

const expectNoDrawStateChangeAfterDrawEvent = (clientSocket, drawEvent, drawStateVersion) => {
  return new Promise(resolve => {
    clientSocket.on('game:no-draw-state-change', () => {
      clientSocket.off()
      resolve()
    })
    clientSocket.emit(`game:draw:${drawEvent}`, drawStateVersion)
  })
}

const expectDrawStateOutOfSyncAfterDrawEvent = (clientSocket, drawEvent, drawStateVersion) => {
  return new Promise(resolve => {
    clientSocket.on('game:draw-state-out-of-sync', () => {
      clientSocket.off()
      resolve()
    })
    clientSocket.emit(`game:draw:${drawEvent}`, drawStateVersion)
  }) 
}

const expectChessGameStatusOfOnlineGame = (clientSocket, expectedGameStatus) => {
  return new Promise(resolve => {
    clientSocket.on('game:current-state', (onlineGameInfo) => {
      expect(onlineGameInfo.gameState.gameStatus).toBe(expectedGameStatus)
      resolve()
    })
    clientSocket.emit('game:recover-state')
  })
}

const expectGameFinishedResponse = (clientSocket, eventName) => {
  return new Promise(resolve => {
    clientSocket.on('game:finished', () => {
      clientSocket.off()
      resolve()
    })
    clientSocket.emit(eventName)
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
        await expectFinalStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 3], to: [4, 7]}, 4)

        await new Promise(resolve => {
          whiteClientSocket.on('user:current-game-status', (onlineGameStatus) => {
            expect(onlineGameStatus).toBe(0)
            resolve()
          })
          whiteClientSocket.emit('user:get-game-status')
        })

        await expectChessGameStatusOfOnlineGame(whiteClientSocket, 4)
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

      test('Attempting to move with an invalid move count leads to no change of the board and appropriate out of sync response', async () => {
        await expectGameStateOutOfSyncAfterMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, null)
        await expectGameStateOutOfSyncAfterMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, undefined)
        await expectGameStateOutOfSyncAfterMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, '0')
        await expectGameStateOutOfSyncAfterMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, {0: 0})

        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)

        await expectGameStateOutOfSyncAfterMove(blackClientSocket, [null, null], '1')
        await expectGameStateOutOfSyncAfterMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 0)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)
      })
    })

    describe('and draw related actions are taken', () => {
      test('If both players agree to a draw (does not have to be during the same move), the game ends', async () => {
        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'make-offer', 0)

        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 1], to: [2, 2]}, 2)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 5], to: [4, 5]}, 3)

        await expectGameConclusionAfterDrawEvent(blackClientSocket, 'make-offer', 1)
      })

      test('Players can decline or withdraw offers', async () => {
        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'make-offer', 0)

        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 1], to: [2, 2]}, 2)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 5], to: [4, 5]}, 3)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'reset-offers', 1)

        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'make-offer', 2)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'reset-offers', 3)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'make-offer', 4)
        
        await expectFinalStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 3], to: [4, 7]}, 4)

        await expectChessGameStatusOfOnlineGame(whiteClientSocket, 4)
      })

      test('Players can choose whether they would like draw offers', async () => {
        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'no-offers', 0)

        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)

        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 1)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 1)

        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'no-offers', 1)

        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'want-offers', 2)

        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'make-offer', 3)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 3)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'make-offer', 3)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 3)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 3)

        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'want-offers', 3)

        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'make-offer', 4)

        await expectGameConclusionAfterDrawEvent(whiteClientSocket, 'make-offer', 5)
      })

      test('Draw related actions that do not change the draw state receive an appropriate response', async () => {
        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'make-offer', 0)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 1)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 1)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'reset-offers', 1)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'reset-offers', 2)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'reset-offers', 2)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'make-offer', 2)
        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'reset-offers', 3)
        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'make-offer', 4)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'make-offer', 5)
        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'reset-offers', 5)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'no-offers', 6)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 7)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'make-offer', 7)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'reset-offers', 7)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'reset-offers', 7)

        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'no-offers', 7)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'make-offer', 8)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 8)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'reset-offers', 8)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'reset-offers', 8)

        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'no-offers', 8)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'no-offers', 8)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'no-offers', 8)

        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'want-offers', 8)
        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'no-offers', 9)
        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'want-offers', 10)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'want-offers', 11)
        await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 11)
        await expectNoDrawStateChangeAfterDrawEvent(whiteClientSocket, 'make-offer', 11)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'want-offers', 11)
        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'make-offer', 12)
        await expectGameConclusionAfterDrawEvent(whiteClientSocket, 'make-offer', 13)

      })

      test('Attempting to make a draw related action with outdated draw state leads to an out of sync response', async () => {
        await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'make-offer', 0)
        await expectDrawStateOutOfSyncAfterDrawEvent(whiteClientSocket, 'make-offer', 0)
        await expectDrawStateOutOfSyncAfterDrawEvent(whiteClientSocket, 'make-offer', 2)

        await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'no-offers', 1)
        await expectDrawStateOutOfSyncAfterDrawEvent(whiteClientSocket, 'want-offers', 1)
      })
    })

    describe('and the game is to be terminated early', () => {
      test('Players can choose to resign at any time', async () => {
        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)
        await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 1], to: [2, 2]}, 2)
        await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 5], to: [4, 5]}, 3)

        await new Promise(resolve => {
          const [resolveWhiteReceivedFinalStateUpdate, whiteReceivedFinalStateUpdate] = makeEventTracker()
          const [resolveBlackReceivedFinalStateUpdate, blackReceivedFinalStateUpdate] = makeEventTracker()
          whiteClientSocket.on('game:final-state-update', (finalState) => {
            expect(finalState.gameState.gameStatus).toBe(6)
            whiteClientSocket.off()
            resolveWhiteReceivedFinalStateUpdate()
          })
          blackClientSocket.on('game:final-state-update', (finalState) => {
            expect(finalState.gameState.gameStatus).toBe(6)
            blackClientSocket.off()
            resolveBlackReceivedFinalStateUpdate()
          })
          blackClientSocket.emit('game:resign')
          Promise.all([whiteReceivedFinalStateUpdate, blackReceivedFinalStateUpdate]).then(() => resolve())
        })
      })
    })
  })

  describe('When the game has finished', () => {
    beforeEach(async () => {
      await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [3, 4]}, 0)
      await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)
      await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 1], to: [2, 2]}, 2)
      await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 5], to: [4, 5]}, 3)
      await expectFinalStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 3], to: [4, 7]}, 4)
    })
    
    test('it is not possible to change the state of the game...', async () => {
      await new Promise(resolve => {
        blackClientSocket.on('game:finished', () => {
          blackClientSocket.off()
          resolve()
        })
        blackClientSocket.emit('game:play-move', {from: [6, 0], to: [4, 0]}, 5)
      })

      await expectGameFinishedResponse(whiteClientSocket, 'game:draw:make-offer', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:make-offer', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:make-offer', 0)

      await expectGameFinishedResponse(blackClientSocket, 'game:draw:reset-offers', 0)
      await expectGameFinishedResponse(whiteClientSocket, 'game:draw:reset-offers', 0)

      await expectGameFinishedResponse(blackClientSocket, 'game:draw:want-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:no-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:want-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:no-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:no-offers', 0)

      await expectGameFinishedResponse(blackClientSocket, 'game:resign')
    })

    test('...but it is possible to get a representation of the final state of the online game', async () => {
      await expectGameFinishedResponse(whiteClientSocket, 'game:draw:make-offer', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:make-offer', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:make-offer', 0)

      await expectGameFinishedResponse(blackClientSocket, 'game:draw:reset-offers', 0)
      await expectGameFinishedResponse(whiteClientSocket, 'game:draw:reset-offers', 0)

      await expectGameFinishedResponse(blackClientSocket, 'game:draw:want-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:no-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:want-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:no-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:no-offers', 0)
      await expectGameFinishedResponse(blackClientSocket, 'game:draw:want-offers', 0)

      await expectGameFinishedResponse(blackClientSocket, 'game:resign')

      await expectGameFinishedResponse(whiteClientSocket, 'game:draw:make-offer', 0)

      await new Promise(resolve => {
        whiteClientSocket.on('game:current-state', (onlineGameInfo) => {
          expect(onlineGameInfo.gameState.gameStatus).toBe(4)
          expect(onlineGameInfo.gameState.playerColor).toBe('white')
          expect(onlineGameInfo.gameState.whitePieceInfo[0].type).toBe('pawn')
          expect(onlineGameInfo.gameState.moveHistory).toHaveLength(5)
          expect(onlineGameInfo.drawState.white.offersDraw).toBe(false)
          expect((typeof onlineGameInfo.userState.white.username === 'string')).toBe(true)
          whiteClientSocket.off()
          resolve()
        })
        whiteClientSocket.emit('game:recover-state')
      })
    })
  })

  test('Example game involving invalid requests, promotion, castling, en passant, and more should behave as expected', async () => {
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 2], to: [3, 2]}, 0)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 6], to: [4, 6]}, 1)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [3, 2], to: [4, 2]}, 2)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [4, 6], to: [3, 6]}, 3)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 5], to: [3, 5]}, 4)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [3, 6], to: [2, 5]}, 5)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 4], to: [2, 4]}, 6)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [2, 5], to: [1, 4]}, 7, 2)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [6, 1], to: [4, 1]}, 7)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [4, 2], to: [5, 1]}, 8)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [2, 5], to: [1, 6]}, 9)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [5, 1], to: [6, 2]}, 10)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 6], to: [0, 7]}, 11, 2)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 6], to: [0, 7], promoteTo: null}, 11, 2)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 6], to: [0, 7], promoteTo: ['queen']}, 11, 2)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 6], to: [0, 7], promoteTo: 'king'}, 11, 2)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 6], to: [0, 7], promoteTo: 'pawn'}, 11, 2)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 6], to: [0, 7], promoteTo: 'killer-robot'}, 11, 2)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [1, 6], to: [0, 7], promoteTo: new Date(':D')}, 11, 2)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [1, 6], to: [0, 7], promoteTo: 'queen'}, 11)
    await expectMoveFailureAfterInvalidMove(whiteClientSocket, {from: [6, 2], to: [7, 3]}, 12, 2)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [6, 2], to: [7, 3], promoteTo: 'knight'}, 12)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [7, 5], to: [5, 7]}, 13)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 3], to: [3, 0]}, 14)
    await expectMoveFailureAfterInvalidMove(blackClientSocket, {from: [7, 6], to: [5, 7]}, 15, 2)
    await expectGameStateOutOfSyncAfterMove(blackClientSocket, {from: [7, 6], to: [5, 5]}, 16, 4)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [7, 6], to: [5, 5]}, 15)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [1, 1], to: [2, 1]}, 16)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [7, 4], to: [7, 6]}, 17)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 2], to: [1, 1]}, 18)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [5, 5], to: [3, 4]}, 19)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 1], to: [2, 2]}, 20)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [7, 2], to: [5, 0]}, 21)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [0, 4], to: [0, 2]}, 22)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [3, 4], to: [2, 2]}, 23)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [7, 3], to: [5, 4]}, 24)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [2, 2], to: [0, 3]}, 25)
    await expectGameStateUpdatesAfterValidMove(whiteClientSocket, {from: [3, 0], to: [3, 3]}, 26)
    await expectGameStateUpdatesAfterValidMove(blackClientSocket, {from: [5, 7], to: [4, 6]}, 27)
    await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'make-offer', 0)
    await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'reset-offers', 1)
    await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'make-offer', 2)
    await expectDrawStateUpdatesAfterDrawEvent(blackClientSocket, 'reset-offers', 3)
    await expectDrawStateUpdatesAfterDrawEvent(whiteClientSocket, 'no-offers', 4)
    await expectNoDrawStateChangeAfterDrawEvent(blackClientSocket, 'make-offer', 5)
    await expectFinalStateUpdatesAfterValidMove(whiteClientSocket, {from: [3, 3], to: [6, 6]}, 28)

    await expectChessGameStatusOfOnlineGame(whiteClientSocket, 4)
    await expectChessGameStatusOfOnlineGame(blackClientSocket, 4)

  })

})