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

  describe('Rook Effects', () => {

    test('Rook marks control on empty squares', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 0], [3, 3]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      const controlCoords = [[0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3], [7, 3],
        [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6], [3, 7]]
      opponentControlInformation.expectState(controlCoords)

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[7, 7], [0, 7]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'black', 'test')
      const controlCoords2 = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
        [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7]]
      opponentControlInformation2.expectState(controlCoords2)
    })

    test('Rook marks control on unobstructed friendly pieces, but not on opposing pieces', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 7], [3, 3]], [[1, 0], [5, 3]], [[6, 0], [3, 5]], [[1, 1], [3, 7]], [[1, 2], [3, 2]], [[6, 1], [2, 3]], [[1, 3], [6, 3]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      const controlCoords = [[4, 3], [5, 3], [3, 4], [3, 2],
        [6, 2], [6, 4], [4, 6], [4, 1], [4, 3], [7, 2], [7, 4]]
      opponentControlInformation.expectState(controlCoords)
    })

    test('Rook stops marking control on squares in a given direction when obstructed by a piece', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[7, 0], [0, 0]], [[6, 5], [4, 0]], [[1, 7], [0, 4]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      const controlCoords = [[1, 0], [2, 0], [3, 0], [4, 0], [0, 1], [0, 2], [0, 3],
        [3, 1]]
      opponentControlInformation.expectState(controlCoords)
    })

    test('Rook does not mark contol on an obstructed friendly piece', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 7], [0, 0]], [[6, 0], [0, 1]], [[6, 1], [2, 0]], [[1, 0], [3, 0]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[1, 0], [4, 1]])
    })

    test('Rook pins opponent pieces correctly', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[7, 0], [7, 7]], [[0, 4], [7, 5]], [[1, 0], [7, 6]], [[1, 1], [6, 7]], [[7, 7], [7, 0]], [[1, 2], [6, 0]], [[1, 3], [7, 3]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState(
        [[7, 1], [7, 2]],
        'default',
        [{ origin: [7, 0], location: [7, 3] }, { origin: [7, 7], location: [7, 6] }]
      )

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[6, 0], [1, 0]], [[0, 0], [0, 0]], [[6, 1], [0, 1]], [[1, 3], [0, 3]], [[7, 4], [0, 4]], [[1, 6], [0, 5]], [[0, 7], [0, 7]], [[6, 2], [1, 7]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'white', 'test')
      opponentControlInformation2.expectState(
        [[0, 5], [0, 6], [1, 2], [1, 4], [1, 6]],
        'default',
        []
      )

      const testBoard3 = new AugmentedBoard('test')
      testBoard3.initialiseBoard([[[1, 0], [7, 1]], [[7, 0], [7, 0]], [[1, 1], [6, 0]], [[1, 2], [4, 0]], [[0, 4], [3, 0]], [[6, 0], [2, 0]], [[6, 1], [1, 0]], [[7, 7], [0, 0]], [[1, 3], [0, 1]]])
      const opponentControlInformation3 = new OpponentControlInformation(testBoard3, 'black', 'test')
      opponentControlInformation3.expectState(
        [[1, 0], [1, 1]],
        'default',
        []
      )

      const testBoard4 = new AugmentedBoard('test')
      testBoard4.initialiseBoard([[[6, 0], [7, 6]], [[0, 0], [7, 7]], [[1, 0], [5, 7]], [[6, 1], [4, 7]], [[7, 4], [2, 7]], [[0, 7], [0, 7]], [[6, 2], [0, 6]]])
      const opponentControlInformation4 = new OpponentControlInformation(testBoard4, 'white', 'test')
      opponentControlInformation4.expectState(
        [[6, 7], [5, 7], [6, 6], [1, 7]],
        createInstanceVariablesComparisonObject(true, 15, [0, 7], [2, 7], false),
        []
      )
    })

    test('Rook puts king in check when path to king is unobstructed, with instance variables correctly updated', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[1, 0], [6, 0]], [[7, 0], [7, 0]], [[0, 4], [7, 4]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState(
        [[7, 1], [7, 2], [7, 3]],
        createInstanceVariablesComparisonObject(true, 24, [7, 0], [7, 4], false),
        []
      )

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[6, 0], [1, 0]], [[0, 0], [0, 0]], [[7, 4], [0, 1]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'white', 'test')
      opponentControlInformation2.expectState(
        [],
        createInstanceVariablesComparisonObject(true, 8, [0, 0], [0, 1], false),
        []
      )

      const testBoard3 = new AugmentedBoard('test')
      testBoard3.initialiseBoard([[[1, 0], [6, 0]], [[7, 0], [7, 0]], [[0, 4], [7, 1]], [[7, 7], [7, 7]], [[1, 1], [6, 7]]])
      const opponentControlInformation3 = new OpponentControlInformation(testBoard3, 'black', 'test')
      opponentControlInformation3.expectState(
        [[7, 6], [7, 5], [7, 4], [7, 3], [7, 2]],
        'double',
        []
      )
    })
  })

  describe('Bishop Effects', () => {

    test('Bishop marks control on empty squares', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 2], [0, 0]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]])

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[7, 5], [5, 5]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'black', 'test')
      opponentControlInformation2.expectState([[6, 6], [7, 7], [4, 6], [3, 7], [6, 4], [7, 3], [4, 4], [3, 3], [2, 2], [1, 1], [0, 0]])
    })

    test('Bishop stops marking control on squares in a given direction when obstructed by a piece', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 5], [2, 5]], [[1, 0], [3, 4]], [[6, 0], [3, 6]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[3, 4], [1, 6], [0, 7], [1, 4], [0, 3], [4, 3], [4, 5]])
    })

    test('Bishop marks control on unobstructed friendly pieces, but not on opposing pieces', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[7, 5], [1, 5]], [[6, 5], [0, 4]], [[1, 5], [0, 6]], [[1, 0], [2, 6]], [[6, 0], [3, 7]], [[6, 1], [3, 3]], [[1, 1], [5, 1]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState([[0, 4], [2, 4], [3, 3], [2, 2], [2, 4]])
    })

    test('Bishop does not mark contol on an obstructed friendly piece', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 2], [0, 0]], [[6, 0], [2, 2]], [[1, 0], [4, 4]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState([[1, 1], [5, 3], [5, 5]])
    })

    test('Bishop pins opponent pieces correctly', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[0, 5], [0, 7]], [[6, 0], [1, 6]], [[7, 4], [2, 5]], [[0, 2], [7, 0]], [[6, 1], [4, 3]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
      opponentControlInformation.expectState(
        [[6, 1], [5, 2]],
        'default',
        [{ origin: [7, 0], location: [4, 3] }, { origin: [0, 7], location: [1, 6] }]
      )

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[7, 2], [7, 7]], [[6, 0], [6, 6]], [[0, 4], [4, 4]], [[7, 2], [0, 0]], [[1, 0], [1, 1]], [[6, 1], [3, 3]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'black', 'test')
      opponentControlInformation2.expectState(
        [[6, 6], [5, 5], [5, 7], [2, 2], [2, 4]],
        'default',
        []
      )

      const testBoard3 = new AugmentedBoard('test')
      testBoard3.initialiseBoard([[[0, 2], [7, 0]], [[6, 0], [5, 2]], [[6, 1], [4, 3]], [[7, 4], [3, 4]], [[1, 0], [2, 5]], [[1, 1], [1, 6]], [[0, 5], [0, 7]]])
      const opponentControlInformation3 = new OpponentControlInformation(testBoard3, 'white', 'test')
      opponentControlInformation3.expectState(
        [[6, 1], [1, 6], [2, 5], [2, 7], [3, 6]],
        createInstanceVariablesComparisonObject(true, 0, [2, 5], [3, 4], false),
        []
      )

      const testBoard4 = new AugmentedBoard('test')
      testBoard4.initialiseBoard([[[0, 2], [0, 0]], [[1, 0], [1, 1]], [[6, 0], [2, 2]], [[7, 4], [3, 3]], [[0, 5], [7, 7]]])
      const opponentControlInformation4 = new OpponentControlInformation(testBoard4, 'white', 'test')
      opponentControlInformation4.expectState(
        [[1, 1], [2, 0], [4, 4], [5, 5], [6, 6]],
        createInstanceVariablesComparisonObject(true, 13, [7, 7], [3, 3], false),
        []
      )
    })

    test('Bishop puts king in check when path to king is unobstructed, with instance variables correctly updated', () => {
      const testBoard = new AugmentedBoard('test')
      testBoard.initialiseBoard([[[7, 5], [7, 0]], [[0, 4], [0, 7]]])
      const opponentControlInformation = new OpponentControlInformation(testBoard, 'black', 'test')
      opponentControlInformation.expectState(
        [[6, 1], [5, 2], [4, 3], [3, 4], [2, 5], [1, 6]],
        createInstanceVariablesComparisonObject(true, 29, [7, 0], [0, 7], false),
        []
      )

      const testBoard2 = new AugmentedBoard('test')
      testBoard2.initialiseBoard([[[0, 5], [0, 7]], [[7, 4], [1, 6]], [[6, 0], [7, 0]]])
      const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'white', 'test')
      opponentControlInformation2.expectState(
        [],
        createInstanceVariablesComparisonObject(true, 13, [0, 7], [1, 6], false),
        []
      )

      const testBoard3 = new AugmentedBoard('test')
      testBoard3.initialiseBoard([[[0, 2], [0, 0]], [[7, 4], [1, 1]], [[0, 5], [7, 7]]])
      const opponentControlInformation3 = new OpponentControlInformation(testBoard3, 'white', 'test')
      opponentControlInformation3.expectState(
        [[2, 2], [3, 3], [4, 4], [5, 5], [6, 6]],
        'double',
        []
      )
    })

    describe('Queen Effects', () => {
      test('Queen marks control on empty squares', () => {
        const testBoard = new AugmentedBoard('test')
        testBoard.initialiseBoard([[[0, 3], [3, 3]]])
        const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
        opponentControlInformation.expectState([[2, 2], [1, 1], [0, 0], [2, 3], [1, 3], [0, 3], [2, 4], [1, 5],
          [0, 6], [3, 4], [3, 5], [3, 6], [3, 7], [4, 4], [5, 5], [6, 6], [7, 7], [4, 3], [5, 3], [6, 3],
          [7, 3], [4, 2], [5, 1], [6, 0], [3, 2], [3, 1], [3, 0]])
      })

      /* As desired and as is currently implemented by the code, the queen has the behaviour of the bishop combined with the behaviour
      of the rook. Because the bishop and rook behave as expected, extensive testing for the queen will not be done. */

      test('Queen doesn\'t behave in an unexpected way', () => {
        const testBoard = new AugmentedBoard('test')
        testBoard.initialiseBoard([[[0, 3], [2, 2]], [[1, 0], [1, 2]], [[6, 0], [1, 3]], [[6, 1], [2, 5]], [[1, 1], [5, 5]],
          [[7, 7], [3, 2]], [[7, 4], [5, 2]], [[7, 0], [7, 2]], [[1, 2], [3, 1]], [[1, 3], [4, 0]], [[1, 4], [2, 1]],
          [[6, 2], [2, 0]], [[6, 3], [1, 1]], [[1, 5], [0, 0]]])
        const opponentControlInformation = new OpponentControlInformation(testBoard, 'white', 'test')
        opponentControlInformation.expectState(
          [[1, 2], [2, 1], [2, 3], [2, 4], [3, 3], [4, 4], [5, 5], [6, 4], [6, 6], [3, 1], [4, 0], [4, 2], [5, 1], [2, 1], [3, 0]],
          'default',
          [{ origin: [2, 2], location: [3, 2] }]
        )

        const testBoard2 = new AugmentedBoard('test')
        testBoard2.initialiseBoard([[[7, 3], [0, 0]], [[6, 0], [0, 7]], [[6, 1], [0, 6]], [[0, 4], [0, 5]],
          [[1, 0], [1, 0]], [[1, 1], [1, 1]], [[1, 2], [1, 6]], [[1, 3], [2, 6]], [[1, 4], [3, 6]], [[1, 5], [3, 7]]])
        testBoard2.promotePiece([0, 7], 'queen')
        testBoard2.promotePiece([0, 6], 'queen')
        testBoard2.movePiece([0, 6], [2, 7])
        const opponentControlInformation2 = new OpponentControlInformation(testBoard2, 'black', 'test')
        opponentControlInformation2.expectState(
          [[0, 1], [0, 2], [0, 3], [0, 4], [0, 6], [0, 7], [1, 7], [2, 7]],
          'double',
          [{ origin: [2, 7], location: [1, 6] }]
        )

        const testBoard3 = new AugmentedBoard('test')
        testBoard3.initialiseBoard([[[7, 3], [7, 0]], [[1, 0], [7, 1]], [[1, 1], [6, 1]], [[0, 4], [5, 0]], [[6, 0], [4, 0]], [[1, 2], [3, 0]]])
        const opponentControlInformation3 = new OpponentControlInformation(testBoard3, 'black', 'test')
        opponentControlInformation3.expectState(
          [[6, 0], [3, 1]],
          createInstanceVariablesComparisonObject(true, 27, [7, 0], [5, 0], false),
          []
        )
      })
    })
  })
})
