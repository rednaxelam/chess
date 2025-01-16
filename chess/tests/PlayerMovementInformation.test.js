const AugmentedBoard = require('../AugmentedBoard')
const OpponentControlInformation = require('../OpponentControlInformation')
const PlayerMovementInformation = require('../PlayerMovementInformation')

function initialisePMI(moveList, color, moveCountList, enPassantableCoordsList) {
  const opponentColor = color === 'white' ? 'black' : 'white'

  const testBoard = new AugmentedBoard('test')
  testBoard.initialiseBoard(moveList)
  if (moveCountList) {
    for (const moveCountElement of moveCountList) {
      const piece = testBoard.getPiece(moveCountElement[0])
      const moveCount = moveCountElement[1]
      for (let i = 0; i < moveCount; i++) {
        piece.incrementMoveCount()
      }
    }
  }
  if (enPassantableCoordsList) {
    for (const coords of enPassantableCoordsList) {
      testBoard.getPiece(coords).setIsEnPassantable(true)
    }
  }
  const opponentControlInformation = new OpponentControlInformation(testBoard, opponentColor, 'test')
  return new PlayerMovementInformation(testBoard, opponentControlInformation, 'test')
}

describe('PlayerMovementInformation Testing', () => {
  describe('Pawn Movement', () => {
    describe('When not in check', () => {

      // when a pawn is not pinned, it's pinStatus is -1. Otherwise, it's pinStatus is equal to the moveLine between the pawn and the pinning piece

      test('Pawn is able to move forward to empty square immediately in front of it when pinStatus is -1 or 0', () => {
        const playerMovementInformation = initialisePMI([[[1, 0], [1, 3]], [[6, 0], [6, 0]]], 'white')
        playerMovementInformation.expectMoves([1, 3], [[2, 3], [3, 3]])

        const playerMovementInformation2 = initialisePMI([[[1, 0], [1, 3]], [[6, 0], [6, 0]]], 'black')
        playerMovementInformation2.expectMoves([6, 0], [[5, 0], [4, 0]])

        const playerMovementInformation3 = initialisePMI([[[6, 4], [6, 4]], [[7, 4], [7, 4]], [[0, 3], [0, 4]]], 'black')
        playerMovementInformation3.expectMoves([6, 4], [[5, 4], [4, 4]])
      })

      test('Pawn is unable to move forward when square in front of it is occupied or pinStatus is not -1 or 0', () => {
        const playerMovementInformation = initialisePMI([[[1, 7], [3, 7]], [[6, 7], [4, 7]]], 'white')
        playerMovementInformation.expectMoves([3, 7], [])

        const playerMovementInformation2 = initialisePMI([[[6, 5], [6, 5]], [[7, 4], [7, 4]], [[0, 5], [4, 7]]], 'black')
        playerMovementInformation2.expectMoves([6, 5], [])
      })

      test('Pawn is able to move two squares forward if both are unoccupied, it hasn\'t moved before, and pinStatus is -1 or 0', () => {
        const playerMovementInformation = initialisePMI([[[1, 0], [1, 0]], [[0, 4], [0, 0]], [[7, 3], [7, 0]]], 'white')
        playerMovementInformation.expectMoves([1, 0], [[2, 0], [3, 0]])

        const playerMovementInformation2 = initialisePMI([[[1, 0], [1, 0]], [[6, 0], [6, 0]]], 'black')
        playerMovementInformation2.expectMoves([6, 0], [[4, 0], [5, 0]])
      })

      test('Pawn is unable to move two squares forward if one of them is occupied, it has moved before, or pinstatus is not -1 or 0', () => {
        const playerMovementInformation = initialisePMI([[[1, 4], [1, 4]], [[6, 4], [2, 4]]], 'white')
        playerMovementInformation.expectMoves([1, 4], [])

        const playerMovementInformation2 = initialisePMI([[[1, 4], [1, 4]], [[6, 4], [3, 4]]], 'white')
        playerMovementInformation2.expectMoves([1, 4], [[2, 4]])

        const playerMovementInformation3 = initialisePMI([[[1, 2], [1, 2]], [[6, 5], [5, 5]]], 'black', [[[5, 5], 1]])
        playerMovementInformation3.expectMoves([5, 5], [[4, 5]])

        const playerMovementInformation4 = initialisePMI([[[6, 3], [6, 3]], [[7, 4], [7, 4]], [[0, 3], [3, 0]]], 'black')
        playerMovementInformation4.expectMoves([6, 3], [])
      })

      test('Pawn is able to take diagonally in front of it when the square is occupied by an opponent piece and the pawn is not pinned', () => {
        const playerMovementInformation = initialisePMI([[[1, 4], [1, 4]], [[6, 0], [2, 5]]], 'white')
        playerMovementInformation.expectMoves([1, 4], [[2, 4], [3, 4], [2, 5]])

        const playerMovementInformation2 = initialisePMI([[[1, 7], [1, 7]], [[6, 0], [2, 6]]], 'white')
        playerMovementInformation2.expectMoves([1, 7], [[2, 6], [2, 7], [3, 7]])

        const playerMovementInformation3 = initialisePMI([[[6, 7], [5, 7]], [[1, 6], [4, 6]]], 'black', [[[5, 7], 1]])
        playerMovementInformation3.expectMoves([5, 7], [[4, 6], [4, 7]])

        const playerMovementInformation4 = initialisePMI([[[6, 3], [2, 3]], [[0, 0], [1, 4]]], 'black', [[[2, 3], 3]])
        playerMovementInformation4.expectMoves([2, 3], [[1, 4], [1, 3]])

        const playerMovementInformation5 = initialisePMI([[[1, 4], [4, 4]], [[7, 3], [5, 3]], [[7, 0], [5, 5]], [[0, 3], [5, 4]]], 'white', [[[4, 4], 1]])
        playerMovementInformation5.expectMoves([4, 4], [[5, 3], [5, 5]])
      })

      test('When pinned, a pawn is only able to take in the direction of the pin', () => {
        const playerMovementInformation = initialisePMI([[[1, 4], [3, 4]], [[7, 2], [4, 5]], [[0, 4], [1, 2]]], 'white')
        playerMovementInformation.expectMoves([3, 4], [[4, 5]])

        const playerMovementInformation2 = initialisePMI([[[6, 5], [6, 5]], [[7, 4], [7, 4]], [[0, 5], [5, 6]]], 'black')
        playerMovementInformation2.expectMoves([6, 5], [[5, 6]])

        const playerMovementInformation3 = initialisePMI([[[7, 4], [4, 3]], [[6, 0], [3, 2]], [[1, 1], [3, 1]], [[0, 2], [1, 0]]], 'black', [[[3, 1], 1]], [[3, 1]])
        playerMovementInformation3.expectMoves([3, 2], [[2, 1]])
      })

      test('Pawn is able to capture another pawn via en passant when it is enPassantable. If pinned, it can only take in the direction of the pin', () => {
        const playerMovementInformation = initialisePMI([[[1, 2], [4, 2]], [[6, 1], [4, 1]]], 'white', [[[4, 2],  2]], [[4, 1]])
        playerMovementInformation.expectMoves([4, 2], [[5, 1], [5, 2]])

        const playerMovementInformation2 = initialisePMI([[[1, 6], [3, 6]], [[6, 7], [3, 7]]], 'black', [[[3, 7], 2], [[3, 6], 1]], [[3, 6]])
        playerMovementInformation2.expectMoves([3, 7], [[2, 6], [2, 7]])

        const playerMovementInformation3 = initialisePMI([[[0, 4], [3, 6]], [[1, 1], [4, 5]], [[6, 4], [4, 4]], [[7, 2], [7, 2]]], 'white', [[[4, 5], 2]], [[4, 4]])
        playerMovementInformation3.expectMoves([4, 5], [[5, 4]])
      })

    })

    describe('When in single check', () => {
      test('Pinned pawns can\'t move', () => {
        const playerMovementInformation = initialisePMI([[[7, 3], [7, 2]], [[7, 0], [5, 2]], [[1, 3], [6, 3]], [[0, 4], [5, 4]]], 'white', [[[6, 3], 4]])
        playerMovementInformation.expectMoves([6, 3], [])

        const playerMovementInformation2 = initialisePMI([[[7, 4], [4, 4]], [[6, 3], [3, 3]], [[0, 3], [2, 2]], [[1, 5], [2, 5]], [[0, 7], [4, 7]]], 'black', [[[3, 3], 2]])
        playerMovementInformation2.expectMoves([3, 3], [])

        const playerMovementInformation3 = initialisePMI([[[6, 5], [4, 5]], [[7, 4], [4, 4]], [[0, 0], [4, 7]], [[0, 3], [2, 6]]], 'black', [[[4, 5], 1]])
        playerMovementInformation3.expectMoves([4, 5], [])
      })

      test('Pawn can move forward only if it blocks a check', () => {
        const playerMovementInformation = initialisePMI([[[1, 3], [1, 3]], [[0, 4], [3, 2]], [[7, 7], [3, 7]]], 'white')
        playerMovementInformation.expectMoves([1, 3], [[3, 3]])

        const playerMovementInformation2 = initialisePMI([[[6, 3], [6, 3]], [[7, 4], [5, 4]], [[0, 2], [2, 1]]], 'black')
        playerMovementInformation2.expectMoves([6, 3], [[4, 3]])

        const playerMovementInformation3 = initialisePMI([[[6, 5], [5, 5]], [[7, 4], [4, 4]], [[0, 3], [1, 7]]], 'black', [[[5, 5], 1]])
        playerMovementInformation3.expectMoves([5, 5], [])

        const playerMovementInformation4 = initialisePMI([[[6, 4], [6, 4]], [[7, 4], [5, 4]], [[0, 0], [0, 4]]], 'black')
        playerMovementInformation4.expectMoves([6, 4], [])

        const playerMovementInformation5 = initialisePMI([[[0, 4], [3, 4]], [[1, 3], [1, 3]], [[7, 2], [2, 3]]], 'white')
        playerMovementInformation5.expectMoves([1, 3], [])

        const playerMovementInformation6 = initialisePMI([[[1, 6], [1, 6]], [[0, 4], [2, 4]], [[7, 3], [2, 7]]], 'white')
        playerMovementInformation6.expectMoves([1, 6], [[2, 6], [2, 7]])
      })

      test('Pawn can take only if it takes the checking piece', () => {
        const playerMovementInformation = initialisePMI([[[1, 4], [2, 4]], [[0, 4], [2, 5]], [[7, 0], [3, 5]], [[6, 0], [3, 3]]], 'white', [[[2, 4], 1]])
        playerMovementInformation.expectMoves([2, 4], [[3, 5]])

        const playerMovementInformation2 = initialisePMI([[[7, 4], [4, 4]], [[6, 2], [3, 2]], [[1, 3], [3, 3]]], 'black', [[[3, 2], 2]], [[3, 3]])
        playerMovementInformation2.expectMoves([3, 2], [[2, 3]])

        const playerMovementInformation3 = initialisePMI([[[1, 0], [4, 0]], [[6, 1], [4, 1]], [[0, 4], [3, 2]]], 'white', [[[4, 0], 2]], [[4, 1]])
        playerMovementInformation3.expectMoves([4, 0], [[5, 1]])

        const playerMovementInformation4 = initialisePMI([[[6, 2], [6, 2]], [[0, 2], [4, 2]], [[7, 4], [6, 4]]], 'black')
        playerMovementInformation4.expectMoves([6, 2], [])

        const playerMovementInformation5 = initialisePMI([[[1, 1], [3, 1]], [[6, 2], [3, 2]], [[7, 4], [4, 0]]], 'black', [[[3, 2], 3]], [[3, 1]])
        playerMovementInformation5.expectMoves([3, 2], [[2, 1]])

        const playerMovementInformation6 = initialisePMI([[[0, 4], [1, 3]], [[1, 5], [1, 5]], [[6, 4], [2, 4]], [[6, 6], [2, 6]]], 'white')
        playerMovementInformation6.expectMoves([1, 5], [[2, 4]])

        const playerMovementInformation7 = initialisePMI([[[6, 3], [6, 3]], [[0, 7], [5, 4]], [[7, 4], [7, 4]]], 'black')
        playerMovementInformation7.expectMoves([6, 3], [[5, 4]])

        const playerMovementInformation8 = initialisePMI([[[6, 3], [6, 3]], [[7, 4], [7, 0]], [[0, 5], [5, 2]]], 'black')
        playerMovementInformation8.expectMoves([6, 3], [[5, 2]])
      })
    })

  })

  describe('Knight Movement', () => {
    describe('When not in check', () => {
      test('Knight is able to move in the expected way when not pinned', () => {
        const playerMovementInformation = initialisePMI([[[0, 6], [3, 3]], [[6, 0], [6, 0]]], 'white')
        playerMovementInformation.expectMoves([3, 3], [[5, 2], [5, 4], [4, 5], [2, 5], [1, 2], [1, 4], [4, 1], [2, 1]])

        const playerMovementInformation2 = initialisePMI([[[7, 1], [3, 1]], [[1, 7], [1, 7]]], 'black')
        playerMovementInformation2.expectMoves([3, 1], [[5, 0], [5, 2], [4, 3], [2, 3], [1, 2], [1, 0]])

        const playerMovementInformation3 = initialisePMI([[[0, 1], [0, 0]], [[6, 1], [2, 1]]], 'white')
        playerMovementInformation3.expectMoves([0, 0], [[2, 1], [1, 2]])

        const playerMovementInformation4 = initialisePMI([[[7, 6], [5, 6]], [[7, 7], [7, 7]], [[6, 4], [6, 4]], [[0, 1], [4, 4]], [[1, 7], [3, 7]]], 'black')
        playerMovementInformation4.expectMoves([5, 6], [[7, 5], [4, 4], [3, 5], [3, 7]])

        const playerMovementInformation5 = initialisePMI([[[0, 1], [3, 2]], [[1, 0], [4, 0]], [[7, 0], [5, 1]], [[7, 1], [5, 3]], [[1, 3], [1, 3]]], 'white')
        playerMovementInformation5.expectMoves([3, 2], [[4, 4], [2, 4], [1, 1], [2, 0], [5, 1], [5, 3]])
      })
    })

    describe('When in single check', () => {
      test('Knight is able to block or remove checking piece when not pinned', () => {
        const playerMovementInformation = initialisePMI([[[0, 1], [2, 5]], [[0, 4], [2, 2]], [[7, 5], [6, 6]]], 'white')
        playerMovementInformation.expectMoves([2, 5], [[3, 3], [4, 4]])

        const playerMovementInformation2 = initialisePMI([[[7, 1], [7, 1]], [[7, 4], [7, 4]], [[1, 3], [6, 3]]], 'black')
        playerMovementInformation2.expectMoves([7, 1], [[6, 3]])

        const playerMovementInformation3 = initialisePMI([[[0, 6], [3, 5]], [[0, 4], [4, 4]], [[7, 0], [4, 0]]], 'white')
        playerMovementInformation3.expectMoves([3, 5], [[4, 3]])

        const playerMovementInformation4 = initialisePMI([[[7, 6], [5, 2]], [[7, 4], [5, 4]], [[0, 0], [5, 1]], [[0, 1], [3, 3]]], 'black')
        playerMovementInformation4.expectMoves([5, 2], [])

        const playerMovementInformation5 = initialisePMI([[[0, 6], [2, 3]], [[7, 3], [4, 4]], [[0, 4], [2, 6]]], 'white')
        playerMovementInformation5.expectMoves([2, 3], [[4, 4], [3, 5]])
      })
    })

    describe('When pinned', () => {
      test('Knight is unable to move', () => {
        const playerMovementInformation = initialisePMI([[[0, 6], [2, 6]], [[0, 4], [1, 5]], [[7, 3], [4, 5]], [[7, 5], [3, 7]]], 'white')
        playerMovementInformation.expectMoves([2, 6], [])

        const playerMovementInformation2 = initialisePMI([[[7, 6], [3, 3]], [[7, 4], [2, 4]], [[6, 2], [5, 2]], [[0, 2], [6, 0]], [[1, 2], [1, 2]]], 'black')
        playerMovementInformation2.expectMoves([3, 3], [])
      })
    })
  })

  describe('Bishop Movement', () => {
    describe('When not in check', () => {
      test('Bishop is able to move diagonally to empty squares', () => {
        const playerMovementInformation = initialisePMI([[[0, 2], [3, 3]], [[6, 3], [6, 3]]], 'white')
        const movementCoords = [[0, 0], [1, 1], [2, 2], [4, 4], [5, 5], [6, 6], [7, 7],
          [6, 0], [5, 1], [4, 2], [2, 4], [1, 5], [0, 6]]
        playerMovementInformation.expectMoves([3, 3], movementCoords)

        const playerMovementInformation2 = initialisePMI([[[7, 2], [6, 1]], [[1, 1], [1, 1]]], 'black')
        playerMovementInformation2.expectMoves([6, 1], [[7, 0], [5, 2], [4, 3], [3, 4], [2, 5], [1, 6], [0, 7], [7, 2], [5, 0]])

        const playerMovementInformation3 = initialisePMI([[[0, 5], [0, 7]], [[6, 7], [6, 7]]], 'white')
        playerMovementInformation3.expectMoves([0, 7], [[1, 6], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1], [7, 0]])

        const playerMovementInformation4 = initialisePMI([[[7, 5], [1, 0]], [[1, 7], [1, 7]]], 'black')
        playerMovementInformation4.expectMoves([1, 0], [[0, 1], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6]])
      })

      test('Bishop is able to take pieces of the opposite color, but not those of the same color', () => {
        const playerMovementInformation = initialisePMI([[[0, 5], [4, 3]], [[7, 2], [7, 0]], [[6, 4], [5, 4]], [[1, 4], [3, 4]], [[1, 1], [2, 1]]], 'white')
        playerMovementInformation.expectMoves([4, 3], [[5, 4], [5, 2], [6, 1], [7, 0], [3, 2]])

        const playerMovementInformation2 = initialisePMI([[[7, 5], [4, 6]], [[7, 6], [6, 4]], [[1, 7], [3, 7]], [[1, 4], [2, 4]]], 'black')
        playerMovementInformation2.expectMoves([4, 6], [[5, 7], [5, 5], [3, 5], [2, 4], [3, 7]])

        const playerMovementInformation3 = initialisePMI([[[7, 2], [3, 0]], [[6, 3], [6, 3]], [[0, 3], [0, 3]]], 'black')
        playerMovementInformation3.expectMoves([3, 0], [[4, 1], [5, 2], [2, 1], [1, 2], [0, 3]])
      })

      test('When pinned, the bishop can either not move, or only move along a single moveLine', () => {
        const playerMovementInformation = initialisePMI([[[0, 2], [3, 3]], [[0, 4], [2, 2]], [[7, 3], [4, 4]], [[6, 1], [5, 1]]], 'white')
        playerMovementInformation.expectMoves([3, 3], [[4, 4]])

        const playerMovementInformation2 = initialisePMI([[[7, 2], [5, 3]], [[7, 4], [7, 1]], [[1, 2], [4, 2]], [[0, 3], [1, 7]]], 'black')
        playerMovementInformation2.expectMoves([5, 3], [[6, 2], [4, 4], [3, 5], [2, 6], [1, 7]])

        const playerMovementInformation3 = initialisePMI([[[0, 5], [3, 7]], [[0, 4], [5, 7]], [[7, 7], [1, 7]], [[7, 3], [2, 6]]], 'white')
        playerMovementInformation3.expectMoves([3, 7], [])
      })
    })

    describe('When in check', () => {
      test('Pinned bishop is unable to move', () => {
        const playerMovementInformation = initialisePMI([[[0, 4], [1, 1]], [[0, 2], [3, 3]], [[7, 3], [5, 5]], [[7, 7], [5, 1]]], 'white')
        playerMovementInformation.expectMoves([3, 3], [])

        const playerMovementInformation2 = initialisePMI([[[7, 4], [5, 7]], [[7, 2], [4, 7]], [[0, 1], [6, 5]], [[0, 7], [0, 7]]], 'black')
        playerMovementInformation2.expectMoves([4, 7], [])
      })

      test('Bishop is able to take checking pieces in the expected way', () => {
        const playerMovementInformation = initialisePMI([[[0, 2], [0, 6]], [[0, 4], [3, 1]], [[7, 0], [5, 1]]], 'white')
        playerMovementInformation.expectMoves([0, 6], [[5, 1]])

        const playerMovementInformation2 = initialisePMI([[[7, 4], [1, 1]], [[0, 2], [2, 0]], [[7, 2], [3, 1]]], 'black')
        playerMovementInformation2.expectMoves([3, 1], [[2, 0]])

        const playerMovementInformation3 = initialisePMI([[[7, 4], [1, 1]], [[0, 2], [2, 0]], [[7, 2], [4, 2]]], 'black')
        playerMovementInformation3.expectMoves([4, 2], [[2, 0]])

        const playerMovementInformation4 = initialisePMI([[[0, 6], [4, 3]], [[7, 4], [6, 2]], [[7, 2], [7, 6]]], 'black')
        playerMovementInformation4.expectMoves([7, 6], [[4, 3]])
      })

      test('Bishop is able to block checking pieces in the expected way', () => {
        const playerMovementInformation = initialisePMI([[[0, 4], [7, 2]], [[0, 5], [7, 0]], [[7, 7], [2, 2]]], 'white')
        playerMovementInformation.expectMoves([7, 0], [[5, 2]])

        const playerMovementInformation2 = initialisePMI([[[7, 4], [4, 2]], [[7, 2], [4, 4]], [[0, 3], [7, 5]]], 'black')
        playerMovementInformation2.expectMoves([4, 4], [[5, 3]])

        const playerMovementInformation3 = initialisePMI([[[7, 4], [4, 2]], [[7, 5], [7, 1]], [[0, 3], [7, 5]]], 'black')
        playerMovementInformation3.expectMoves([7, 1], [[5, 3]])
      })

      test('Bishop is unable to move if the move does not remove the check', () => {
        const playerMovementInformation = initialisePMI([[[0, 4], [4, 6]], [[0, 2], [4, 3]], [[7, 3], [6, 4]]], 'white')
        playerMovementInformation.expectMoves([4, 3], [])

        const playerMovementInformation2 = initialisePMI([[[7, 1], [6, 2]], [[7, 4], [7, 4]], [[1, 3], [5, 3]], [[1, 5], [6, 5]]], 'black')
        playerMovementInformation2.expectMoves([6, 2], [])
      })
    })
  })
})

