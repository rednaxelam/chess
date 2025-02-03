const ChessGame = require('../ChessGame')

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
})