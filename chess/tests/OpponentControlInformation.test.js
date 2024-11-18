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

    test('Pawns mark control on friendly pieces, but not on opposing pieces', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[6, 1], [5, 1]], [[6, 0], [4, 2]], [[0, 0], [4, 0]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState([[4, 2], [3, 1], [3, 3]])
    })
  })

  describe('Knight Effects', () => {

    test('Knight marks control on empty squares', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 1], [4, 4]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[3, 2], [5, 2], [6, 3], [6, 5], [5, 6], [3, 6], [2, 5], [2, 3]])
    })

    test('Knight marks less squares when obstructed by edges', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[7, 6], [7, 7]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState([[6, 5], [5, 6]])

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[7, 1], [7, 6]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'black', 'test')
      opponentControlInformation2.expectState([[6, 4], [5, 5], [5, 7]])

      const testBoard3 = new AugmentedBoard('test')
      testBoard3.initialiseBoard([[[0, 1], [3, 1]]])
      const opponentControlInformation3 = new OpponentControlInformation(testBoard3, 'white', 'test')
      opponentControlInformation3.expectState([[5, 0], [5, 2], [4, 3], [2, 3], [1, 2], [1, 0]])
    })

    test('Knight can place opponent king in check, and instance variables are updated appropriately', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 6], [6, 3]], [[7, 4], [7, 5]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      const controlCoords = [[7, 1], [5, 1], [4, 2], [4, 4], [5, 5]]
      const instanceVariables = createInstanceVariablesComparisonObject(true, 14, [6, 3], [7, 5], false)
      opponentControlInformation.expectState(controlCoords, instanceVariables)
    })

    test('Knights mark control on friendly pieces, but not on opposing pieces', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[7, 1], [4, 0]], [[6, 0], [6, 1]], [[0, 3], [2, 1]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState([[6, 1], [5, 2], [3, 2], [5, 0], [5, 2]])
    })
  })

  describe('King Effects', () => {

    test('King marks control on empty squares', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 4], [3, 4]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[2, 3], [2, 4], [2, 5], [3, 3], [3, 5], [4, 3], [4, 4], [4, 5]])
    })

    test('King marks less Squares when obstructed by edges', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 4], [0, 7]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[0, 6], [1, 6], [1, 7]])

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[7, 4], [2, 0]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'black', 'test')
      opponentControlInformation2.expectState([[1, 0], [1, 1], [2, 1], [3, 1], [3, 0]])
    })

    test('Putting a king in check with another king leads to an exception', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 4], [0, 5]], [[7, 4], [0, 6]]])
      expect(() => new OpponentControlInformation(testBoard, 'black', 'test')).toThrow()
    })

    test('Kings mark control on friendly pieces, but not on opposing pieces', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[7, 4], [5, 7]], [[6, 7], [4, 7]], [[1, 7], [5, 6]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState([[6, 7], [6, 6], [4, 6], [4, 7], [3, 6]])
    })
  })
})
