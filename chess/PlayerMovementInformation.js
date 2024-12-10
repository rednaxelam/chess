const AugmentedBoard = require('./AugmentedBoard')
const OpponentControlInformation = require('./OpponentControlInformation')
const utils = require('./utils')

class PlayerMovementInformation {

  #test
  #MoveBoard


  constructor(board, opponentControlInformation, test = undefined) {
    if (!(board instanceof AugmentedBoard)) {
      throw new Error('board argument for PlayerMovementInformation constructor must be an AugmentedBoard')
    }

    if (!(opponentControlInformation instanceof OpponentControlInformation)) {
      throw new Error('opponentControlInformation argument for PlayerMovementInformation constructor must be an OpponentControlInformation object')
    }

    const color = opponentControlInformation.getColor() === 'white' ? 'black' : 'white'

    utils.validateTestParameter(test)
    this.#test = test === 'test'

    // create an 8x8 array, each entry of which is a null value
    this.#MoveBoard = new Array(8).fill(undefined).map(() => new Array(8).fill(null))

    const pieceList = color === 'white' ? board.getWhitePieceListIterable() : board.getBlackPieceListIterable()

    // if the king is in a single check, then moving a piece to a square which is true on the checkRemovalBoard will remove the single check
    let checkRemovalBoard = null

    if (opponentControlInformation.hasKingInSingleCheck()) {
      checkRemovalBoard = new Array(8).fill(undefined).map(() => new Array(8).fill(false))
      const checkingPieceType = opponentControlInformation.getCheckingPiece().getType()
      const checkingPieceCoordinates = opponentControlInformation.getCheckingPieceCoordinates()
      if (checkingPieceType === 'king') {
        throw new Error('A king may not place another king in check')
      } else if (checkingPieceType === 'pawn' || checkingPieceType === 'knight') {
        checkRemovalBoard[checkingPieceCoordinates[0]][checkingPieceCoordinates[1]] = true
      } else {
        const kingCoordinates = opponentControlInformation.getKingCoordinates()
        const CKVector = this.#calcVector(checkingPieceCoordinates, kingCoordinates)
        const CKSize = Math.max(Math.abs(CKVector[0]), Math.abs(CKVector[1]))
        const CKIncrement = [CKVector[0] / CKSize, CKVector[1] / CKSize]
        let currentCoords = [checkingPieceCoordinates[0], checkingPieceCoordinates[1]]
        while (!this.#isCoordsEqual(currentCoords, kingCoordinates)) {
          checkRemovalBoard[currentCoords[0]][currentCoords[1]] = true
          currentCoords = this.#addDiff(currentCoords, CKIncrement)
        }
      }
    }
  }

  #calcMoveLine(coords1, coords2) {
    if (this.#isCoordsEqual(coords1, coords2)) {
      throw new Error('Coordinates supplied as arguments to calcMoveLine must be distinct')
    }
    const vector12 = this.#calcVector(coords1, coords2)
    const size12 = Math.max(Math.abs(vector12[0]), Math.abs(vector12[1]))
    const increment12 = [vector12[0] / size12, vector12[1] / size12]
    if ((Math.abs(increment12[0]) !== 0 && Math.abs(increment12[0]) !== 1)
      || (Math.abs(increment12[1]) !== 0 && Math.abs(increment12[1]) !== 1)) {
      throw new Error('coordinates supplied do not lie on a single movement line')
    } else {
      if (this.#isCoordsEqual(increment12, [1, 0]) || this.#isCoordsEqual(increment12, [-1, 0])) {
        return 0
      } else if (this.#isCoordsEqual(increment12, [1, 1]) || this.#isCoordsEqual(increment12, [-1, -1])) {
        return 1
      } else if (this.#isCoordsEqual(increment12, [0, 1]) || this.#isCoordsEqual(increment12, [0, -1])) {
        return 2
      } else if (this.#isCoordsEqual(increment12, [1, -1]) || this.#isCoordsEqual(increment12, [-1, 1])) {
        return 3
      }
    }
  }

  #isCoordsEqual(coords1, coords2) {
    return coords1[0] === coords2[0] && coords1[1] === coords2[1]
  }

  #calcVector(coords1, coords2) {
    return [coords2[0] - coords1[0], coords2[1] - coords1[1]]
  }

  #addDiff(coords, diff) {
    return [coords[0] + diff[0], coords[1] + diff[1]]
  }

}
