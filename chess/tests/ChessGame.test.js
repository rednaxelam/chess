const ChessGame = require('../ChessGame')
const { isCoordsEqual, addDiff } = require('../utils')

describe('ChessGame Testing', () => {
  describe('Full games', () => {
    test('Game 1 - Fool\'s mate', () => {
      const chessGame = new ChessGame('test')
      chessGame.expectGameStatusesAfterMoves([[[[1, 4], [3, 4]], 1],
        [[[6, 6], [4, 6]], 0],
        [[[0, 1], [2, 2]], 1],
        [[[6, 5], [4, 5]], 0],
        [[[0, 3], [4, 7]], 4]
      ])
    })

    test('Game 2 - en passant, castling, and promotion', () => {
      const chessGame = new ChessGame('test')

      // testing en passant
      chessGame.expectGameStatusesAfterMoves([[[[1, 2], [3, 2]], 1],
        [[[6, 6], [4, 6]], 0],
        [[[3, 2], [4, 2]], 1],
        [[[4, 6], [3, 6]], 0],
        [[[1, 5], [3, 5]], 1],
        [[[3, 6], [2, 5]], 0],
        [[[1, 4], [2, 4]], 1],
        [[[2, 5], [1, 4]], 3],
        [[[6, 1], [4, 1]], 0],
        [[[4, 2], [5, 1]], 1]
      ])

      chessGame.expectEmptySquares([[3, 5], [3, 6], [4, 1], [4, 2]])
      chessGame.expectPieceIdsAtCoords([[[5, 1], 2], [[2, 5], 22]])
      chessGame.expectPiecesRemoved([5, 17])

      // testing promotion
      chessGame.expectGameStatusesAfterMoves([[[[2, 5], [1, 6]], 0],
        [[[5, 1], [6, 2]], 1],
      ])

      chessGame.playMove([1, 6], [0, 7])
      chessGame.expectGameStatus(3)
      chessGame.playMove([1, 6], [0, 7], 'queen')
      chessGame.expectGameStatus(0)
      chessGame.playMove([6, 2], [7, 3])
      chessGame.expectGameStatus(2)
      chessGame.playMove([6, 2], [7, 3], 'knight')
      chessGame.expectGameStatus(1)
      chessGame.expectPieceIdsAtCoords([[[7, 3], 2], [[0, 7], 22]])
      chessGame.expectTypesAtCoords([[[7, 3], 'knight'], [[0, 7], 'queen']])
      chessGame.expectPiecesRemoved([6, 18, 15, 27])
      chessGame.expectEmptySquares([[1, 6], [6, 2], [5, 1], [2, 5]])

      // testing castling
      chessGame.expectGameStatusesAfterMoves([[[[7, 5], [5, 7]], 0],
        [[[0, 3], [3, 0]], 1],
        [[[7, 6], [5, 7]], 3],
        [[[7, 6], [5, 5]], 0],
        [[[1, 1], [2, 1]], 1],
        [[[7, 4], [7, 6]], 0],
        [[[0, 2], [1, 1]], 1],
        [[[5, 5], [3, 4]], 0],
        [[[0, 1], [2, 2]], 1],
        [[[7, 2], [5, 0]], 0],
        [[[0, 4], [0, 2]], 1]
      ])

      chessGame.expectPieceIdsAtCoords([[[0, 2], 12], [[0, 3], 8], [[7, 5], 31], [[7, 6], 28]])
      chessGame.expectEmptySquares([[7, 4], [7, 7], [0, 0], [0, 1], [0, 4]])

      // checkmate for white - king unable to take defended piece

      chessGame.expectGameStatusesAfterMoves([[[[3, 4], [2, 2]], 0],
        [[[7, 3], [5, 4]], 1],
        [[[2, 2], [0, 3]], 0],
        [[[3, 0], [3, 3]], 1],
        [[[5, 7], [4, 6]], 0],
        [[[3, 3], [6, 6]], 4]
      ])
    })

    test('Game 3 - pins and checks', () => {
      const chessGame = new ChessGame('test')

      chessGame.expectGameStatusesAfterMoves([[[[1, 4], [3, 4]], 1],
        [[[6, 3], [4, 3]], 0],
        [[[3, 4], [4, 4]], 1],
        [[[4, 3], [3, 4]], 3],
        [[[7, 4], [6, 3]], 0],
        [[[0, 3], [2, 5]], 1],
        [[[6, 3], [5, 3]], 3],
        [[[6, 3], [5, 2]], 0],
        [[[1, 6], [3, 6]], 1],
        [[[4, 3], [3, 3]], 3],
        [[[4, 3], [3, 4]], 3],
        [[[7, 3], [5, 3]], 0],
        [[[0, 5], [2, 3]], 1],
        [[[7, 6], [5, 5]], 0],
        [[[2, 3], [3, 4]], 1],
        [[[4, 3], [3, 3]], 3],
        [[[4, 3], [3, 4]], 0],
        [[[2, 5], [3, 4]], 1],
        [[[5, 2], [4, 2]], 0],
        [[[0, 4], [1, 4]], 1],
        [[[5, 5], [3, 6]], 0],
        [[[0, 6], [2, 7]], 1],
        [[[5, 3], [1, 3]], 0],
        [[[0, 1], [1, 3]], 1],
        [[[4, 2], [4, 0]], 3],
        [[[4, 2], [4, 1]], 0],
        [[[1, 4], [2, 3]], 1],
        [[[6, 6], [4, 6]], 0],
        [[[2, 3], [3, 3]], 1],
        [[[7, 5], [6, 6]], 0],
        [[[3, 3], [2, 2]], 1],
        [[[6, 5], [4, 5]], 0],
        [[[4, 4], [5, 5]], 1],
        [[[6, 6], [5, 5]], 0],
        [[[3, 4], [4, 4]], 1],
        [[[5, 5], [4, 4]], 0],
        [[[2, 2], [2, 3]], 1],
        [[[3, 6], [1, 5]], 0],
        [[[2, 3], [3, 4]], 2],
        [[[2, 7], [1, 5]], 1],
        [[[7, 2], [3, 6]], 0],
        [[[1, 5], [0, 3]], 1],
        [[[4, 4], [3, 5]], 0],
        [[[0, 7], [0, 6]], 1],
        [[[3, 6], [4, 5]], 0],
        [[[2, 3], [2, 2]], 1],
        [[[3, 5], [4, 4]], 0],
        [[[2, 2], [2, 1]], 1],
        [[[4, 5], [5, 4]], 0],
        [[[2, 1], [2, 0]], 1],
        [[[4, 4], [5, 3]], 0],
        [[[1, 1], [3, 1]], 1],
        [[[5, 3], [3, 1]], 0],
        [[[2, 0], [1, 1]], 1],
        [[[7, 1], [5, 2]], 0],
        [[[1, 1], [0, 1]], 1],
        [[[5, 2], [3, 3]], 0],
        [[[0, 6], [1, 6]], 1],
        [[[5, 4], [4, 5]], 0],
        [[[1, 3], [2, 5]], 1],
        [[[3, 1], [2, 2]], 0],
        [[[1, 7], [2, 7]], 1],
        [[[4, 5], [1, 2]], 0],
        [[[1, 6], [1, 2]], 1],
        [[[4, 1], [3, 0]], 0],
        [[[1, 2], [2, 2]], 1],
        [[[6, 7], [4, 7]], 0],
        [[[0, 1], [1, 1]], 1],
        [[[4, 7], [3, 7]], 0],
        [[[2, 5], [3, 3]], 1],
        [[[4, 6], [3, 6]], 0],
        [[[0, 2], [1, 3]], 1],
        [[[3, 6], [2, 6]], 0],
        [[[2, 2], [3, 2]], 4]
      ])
    })
  })

  describe('End of game detection', () => {
    test('Checkmate detection', () => {
      const chessGame = new ChessGame('test')
      const moveList = [[[7, 4], [7, 4]], [[7, 7], [4, 7]], [[7, 3], [3, 7]], [[1, 5], [1, 5]], [[1, 6], [1, 6]],
        [[0, 4], [0, 4]], [[0, 7], [0, 7]]]
      chessGame.initialiseBoard(moveList, 'white', [[[0, 4], 0], [[0, 7], 0]])
      chessGame.expectGameStatusesAfterMoves([[[[0, 4], [0, 6]], 1],
        [[[3, 7], [0, 7]], 5]
      ])

      const chessGame2 = new ChessGame('test')
      const moveList2 = [[[0, 0], [5, 1]], [[0, 4], [2, 5]], [[1, 6], [2, 6]], [[1, 7], [2, 7]],
        [[7, 4], [4, 6]], [[6, 5], [4, 5]], [[6, 7], [4, 7]]]
      chessGame2.initialiseBoard(moveList2, 'white', [[[2, 6], 1], [[2, 7], 1], [[4, 7], 2], [[4, 5], 1]])
      chessGame2.playMove([2, 7], [3, 7])
      chessGame2.expectGameStatus(4)

      const chessGame3 = new ChessGame('test')
      const moveList3 = [[[7, 1], [7, 1]], [[7, 2], [7, 2]], [[7, 4], [6, 2]], [[6, 1], [6, 1]], [[6, 2], [5, 2]],
        [[0, 0], [0, 3]], [[0, 2], [4, 6]], [[0, 4], [0, 4]]]
      chessGame3.initialiseBoard(moveList3, 'white')
      chessGame3.playMove([4, 6], [7, 3])
      chessGame3.expectGameStatus(4)

      const chessGame4 = new ChessGame('test')
      const moveList4 = [[[7, 4], [7, 4]], [[7, 1], [3, 3]],
        [[1, 0], [1, 0]], [[1, 1], [1, 1]], [[0, 4], [0, 0]], [[0, 0], [0, 1]]]
      chessGame4.initialiseBoard(moveList4, 'black', [[[0, 0], 3], [[0, 1], 2]])
      chessGame4.playMove([3, 3], [1, 2])
      chessGame4.expectGameStatus(5)
    })

    test('Stalemate detection', () => {
      const chessGame = new ChessGame('test')
      chessGame.initialiseBoard([[[6, 6], [6, 6]], [[6, 5], [5, 5]], [[7, 4], [3, 4]],
        [[1, 5], [4, 5]], [[1, 7], [3, 7]], [[0, 4], [4, 7]]], 'black', [[[4, 5], 2], [[3, 7], 1], [[5, 5], 1]])
      chessGame.playMove([3, 4], [4, 5])
      chessGame.expectGameStatus(11)

      const chessGame2 = new ChessGame('test')
      const moveList2 = [[[0, 4], [6, 5]], [[0, 2], [2, 2]], [[1, 0], [2, 0]], [[6, 0], [3, 0]], [[7, 4], [6, 7]]]
      chessGame2.initialiseBoard(moveList2, 'white', [[[2, 0], 1], [[3, 0], 2]])
      chessGame2.playMove([2, 2], [6, 6])
      chessGame2.expectGameStatus(11)

      const chessGame3 = new ChessGame('test')
      chessGame3.initialiseBoard([[[7, 4], [7, 5]], [[0, 4], [4, 5]], [[1, 5], [6, 5]]], 'white', [[[6, 5], 4]])
      chessGame3.playMove([4, 5], [5, 5])
      chessGame3.expectGameStatus(11)

      const chessGame4 = new ChessGame('test')
      const moveList4 = [[[0, 4], [1, 3]], [[6, 4], [1, 4]], [[6, 6], [1, 6]], [[6, 7], [1, 7]], [[7, 4], [0, 7]],
        [[7, 7], [0, 6]], [[7, 2], [0, 5]]]
      const moveCountList4 = [[[1, 4], 4], [[1, 6], 4], [[1, 7], 4], [[0, 7], 12], [[0, 6], 6], [[1, 3], 3]]
      chessGame4.initialiseBoard(moveList4, 'white', moveCountList4)
      chessGame4.playMove([1, 3], [0, 4])
      chessGame4.expectGameStatus(11)
    })
  })

  test('Not possible to play moves or change the game status for a finished game', () => {
    const chessGame = new ChessGame('test')
    chessGame.playMove([1, 7], [3, 7])
    chessGame.expectGameStatus(1)
    chessGame.whiteResigns()
    chessGame.expectGameStatus(7)
    chessGame.playMove([6, 7], [4, 7])
    chessGame.expectGameStatus(7)
    chessGame.whiteResigns()
    chessGame.expectGameStatus(7)
    chessGame.whiteTimeout()
    chessGame.expectGameStatus(7)
    chessGame.blackResigns()
    chessGame.expectGameStatus(7)
    chessGame.blackTimeout()
    chessGame.expectGameStatus(7)
    chessGame.drawViaAgreement()
    chessGame.expectGameStatus(7)
  })

  test('50-move rule works as expected', () => {
    const chessGame = new ChessGame('test')
    chessGame.playMove([1, 4], [2, 4])
    chessGame.playMove([6, 4], [5, 4])
    chessGame.playMove([0, 3], [3, 6])
    chessGame.playMove([7, 3], [4, 6])
    // need to avoid triggering the threefold repetition rule during this test
    let whiteQueenCoords = [3, 6]
    while (!isCoordsEqual(whiteQueenCoords, [3, 0])) {
      let oldWhiteQueenCoords = [whiteQueenCoords[0], whiteQueenCoords[1]]
      whiteQueenCoords = addDiff(oldWhiteQueenCoords, [0, -1])
      chessGame.playMove(oldWhiteQueenCoords, whiteQueenCoords)
      chessGame.playMove([4, 6], [4, 7])

      oldWhiteQueenCoords = [whiteQueenCoords[0], whiteQueenCoords[1]]
      whiteQueenCoords = addDiff(oldWhiteQueenCoords, [0, -1])
      chessGame.playMove(oldWhiteQueenCoords, whiteQueenCoords)
      chessGame.playMove([4, 7], [4, 6])
    }
    chessGame.playMove([0, 6], [2, 7])
    chessGame.playMove([4, 6], [4, 0])
    chessGame.playMove([0, 5], [5, 0])
    chessGame.playMove([6, 7], [5, 7])
    // 17 total moves without a reset at this point
    chessGame.playMove([5, 0], [6, 1])
    chessGame.playMove([6, 6], [5, 6])
    // 0 moves without a reset at this point
    let i = 0
    whiteQueenCoords = [3, 0]
    let whiteQueenDiff = [0, 1]
    let blackQueenCoords = [4, 0]
    let blackQueenCoordsA = [4, 0]
    let blackQueenCoordsB = [4, 1]
    while (i < 99) {
      if (i % 2 === 0) {
        if (isCoordsEqual(whiteQueenCoords, [3, 7])) {
          whiteQueenDiff = [0, -1]
        } else if (isCoordsEqual(whiteQueenCoords, [3, 0])) {
          whiteQueenDiff = [0, 1]
        }
        const oldWhiteQueenCoords = [whiteQueenCoords[0], whiteQueenCoords[1]]
        whiteQueenCoords = addDiff(oldWhiteQueenCoords, whiteQueenDiff)
        chessGame.playMove(oldWhiteQueenCoords, whiteQueenCoords)
        chessGame.expectGameStatus(1)
      } else {
        if (isCoordsEqual(whiteQueenCoords, [3, 0])) {
          blackQueenCoordsA = addDiff(blackQueenCoordsA, [0, 2])
          blackQueenCoordsB = addDiff(blackQueenCoordsB, [0, 2])
          chessGame.playMove(blackQueenCoords, blackQueenCoordsA)
          blackQueenCoords = [blackQueenCoordsA[0], blackQueenCoordsA[1]]
          chessGame.expectGameStatus(0)
        } else if (isCoordsEqual(blackQueenCoords, blackQueenCoordsA)) {
          blackQueenCoords = [blackQueenCoordsB[0], blackQueenCoordsB[1]]
          chessGame.playMove(blackQueenCoordsA, blackQueenCoordsB)
          chessGame.expectGameStatus(0)
        } else {
          blackQueenCoords = [blackQueenCoordsA[0], blackQueenCoordsA[1]]
          chessGame.playMove(blackQueenCoordsB, blackQueenCoordsA)
          chessGame.expectGameStatus(0)
        }
      }

      i++

    }

    // 99 total moves without a reset at this point
    chessGame.expectGameStatus(1)
    chessGame.playMove([7, 4], [6, 4])
    // 100 total moves without a reset at this point
    chessGame.expectGameStatus(12)
  })
})