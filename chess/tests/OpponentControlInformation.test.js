const AugmentedBoard = require('../AugmentedBoard')
const OpponentControlInformation = require('../OpponentControlInformation')

function createInstanceVariablesComparisonObject(hasKingInSingleCheck, checkingPieceId, checkingPieceCoordinates, kingCoordinates, hasKingInDoubleCheck) {
  return {
    hasKingInSingleCheck,
    checkingPieceId,
    checkingPieceCoordinates,
    kingCoordinates,
    hasKingInDoubleCheck,
  }
}

describe('OpponentControlInformation Testing', () => {
  describe('Pawn Effects', () => {

    test('Pawn marks control on empty squares', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[1, 1], [2, 1]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[3, 0], [3, 2]])
    })

    test('Pawn at edge of board only marks one square', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[6, 0], [5, 0]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState([[4, 1]])
    })

    test('Pawn can place opponent king in check, and instance variables are updated appropriately', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[1, 1], [2, 1]], [[7, 4], [3, 2]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      const instanceVariables = createInstanceVariablesComparisonObject(true, 1, [2, 1], [3, 2], false)
      opponentControlInformation.expectState([[3, 0]], instanceVariables)
    })

    test('Pawn marks control on friendly pieces, but not on opposing pieces', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[6, 1], [5, 1]], [[7, 0], [4, 2]], [[0, 0], [4, 0]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState([[4, 2]])
    })
  })
})
