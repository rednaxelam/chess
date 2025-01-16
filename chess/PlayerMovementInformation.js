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

    const moveRemovesCheck = (coords) => checkRemovalBoard[coords[0]][coords[1]]

    let continueFlag = true

    while (continueFlag) {
      const pieceElement = pieceList.popCurrentPieceElement()
      const piece = pieceElement.piece
      const startCoords = pieceElement.coords

      let moveArray
      switch (piece.getType()) {
      case 'pawn':
        moveArray = this.#findPawnMoves(board, startCoords, color, opponentControlInformation, moveRemovesCheck)
        this.#MoveBoard[startCoords[0]][startCoords[1]] = moveArray
        break
      case 'knight':
        moveArray = this.#findKnightMoves(board, startCoords, color, opponentControlInformation, moveRemovesCheck)
        this.#MoveBoard[startCoords[0]][startCoords[1]] = moveArray
        break
      case 'bishop':
        moveArray = this.#findMovesAlongMoveLines(board, startCoords, color, opponentControlInformation, moveRemovesCheck)
        this.#MoveBoard[startCoords[0]][startCoords[1]] = moveArray
        break
      }

      if (!pieceList.hasNextPieceElement()) continueFlag = false
    }

  }

  isValidMove(from, to) {
    if (this.#MoveBoard[from[0]][from[1]] === null) {
      throw new Error('There is no player piece to move at given start coordinates')
    }

    const moveArray = this.#MoveBoard[from[0]][from[1]]
    return moveArray.findIndex(coords => coords[0] === to[0] && coords[1] === to[1]) >= 0
  }

  hasValidMoves() {
    for (const row of this.#MoveBoard) {
      for (const element of row) {
        if (element !== null && element.length > 0) {
          return true
        }
      }
    }

    return false
  }

  #findPawnMoves(board, startCoords, color, opponentControlInformation, moveRemovesCheck) {
    this.#validatePieceType(board, startCoords, 'pawn')

    if (opponentControlInformation.hasKingInDoubleCheck()) {
      return []
    }

    const pawn = board.getPiece(startCoords)

    const possibleMoves = []

    // if pinStatus is -1, then the piece is not pinned. If not, it means that it is pinned along the corresponding moveline
    const pinStatus = !pawn.isPinned() ? -1 : this.#calcMoveLine(startCoords, pawn.getPinOrigin())

    const getNewPosition = color === 'white' ? this.#addDiff : this.#subtractDiff

    if (!opponentControlInformation.hasKingInSingleCheck()) {
      if (pinStatus === -1 || pinStatus === 0) {
        const currentCoords = getNewPosition(startCoords, [1, 0])
        if (board.isEmptySquare(currentCoords)) {
          possibleMoves.push(currentCoords)

          if (pawn.getMoveCount() === 0) {
            const currentCoords = getNewPosition(startCoords, [2, 0])
            if (board.isEmptySquare(currentCoords)) {
              possibleMoves.push(currentCoords)
            }
          }
        }
      }

      const findTakeMove = (moveLine) => {
        let increment

        if (moveLine === 1) increment = [1, 1]
        else if (moveLine === 3) increment = [1, -1]
        else throw new Error('moveLine must be either 1 or 3')

        if (pinStatus === -1 || pinStatus === moveLine) {
          let currentCoords = getNewPosition(startCoords, increment)
          if (this.#isValidCoords(currentCoords)
              && !board.isEmptySquare(currentCoords)
              && board.getPiece(currentCoords).getColor() !== color) {

            possibleMoves.push(currentCoords)
          }

          currentCoords = getNewPosition(startCoords, [0, increment[1]])
          if (this.#isValidCoords(currentCoords)
              && !board.isEmptySquare(currentCoords)
              && board.getPiece(currentCoords).getColor() !== color
              && board.getPiece(currentCoords).getType() === 'pawn'
              && board.getPiece(currentCoords).isEnPassantable()) {

            possibleMoves.push(getNewPosition(startCoords, increment))
          }
        }
      }

      findTakeMove(1)
      findTakeMove(3)

    }

    // if a pawn is pinned, then the check must originate from a piece not on the path from the king to the checking piece
    // moving the pawn off of this path would expose the king to an enemy piece, and thus the pawn can't move if pinned
    if (opponentControlInformation.hasKingInSingleCheck() && pinStatus === -1) {
      let currentCoords = getNewPosition(startCoords, [1, 0])
      if (board.isEmptySquare(currentCoords)
          && moveRemovesCheck(currentCoords)) {

        possibleMoves.push(currentCoords)
      } else if (pawn.getMoveCount() === 0) {
        currentCoords = getNewPosition(startCoords, [2, 0])
        if (board.isEmptySquare(getNewPosition(startCoords, [1, 0]))
            && board.isEmptySquare(currentCoords)
            && moveRemovesCheck(currentCoords)) {

          possibleMoves.push(currentCoords)
        }
      }

      const possibleTakeIncrements = [[1, 1], [1, -1], [0, 1], [0, -1]]
      for (const increment of possibleTakeIncrements) {
        currentCoords = getNewPosition(startCoords, increment)
        if (this.#isValidCoords(currentCoords)
            && !board.isEmptySquare(currentCoords)
            && moveRemovesCheck(currentCoords)) {
          if (increment[0] === 0) {
            if (board.getPiece(currentCoords).getType() === 'pawn'
                && board.getPiece(currentCoords).isEnPassantable()) {

              possibleMoves.push(getNewPosition(startCoords, [1, increment[1]]))
            }
          } else {
            possibleMoves.push(currentCoords)
          }
        }
      }
    }

    return possibleMoves
  }

  #findKnightMoves(board, startCoords, color, opponentControlInformation, moveRemovesCheck) {
    this.#validatePieceType(board, startCoords, 'knight')

    if (opponentControlInformation.hasKingInDoubleCheck()) {
      return []
    }

    const knight = board.getPiece(startCoords)

    // if a piece is pinned, it must move along the line segment from the king to (and including) the pinning piece
    // it is impossible for a knight which is on such a line segment to move in a way such that it is still on that line segment
    // because of this, a pinned knight can't move
    if (knight.isPinned()) {
      return []
    }

    const possibleMoves = []

    const possibleIncrements = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2]]

    if (!opponentControlInformation.hasKingInSingleCheck()) {
      for (const increment of possibleIncrements) {
        const currentCoords = this.#addDiff(startCoords, increment)
        if (this.#isValidCoords(currentCoords)
            && (board.isEmptySquare(currentCoords) || board.getPiece(currentCoords).getColor() !== color)) {
          possibleMoves.push(currentCoords)
        }
      }
    }

    if (opponentControlInformation.hasKingInSingleCheck()) {
      for (const increment of possibleIncrements) {
        const currentCoords = this.#addDiff(startCoords, increment)
        if (this.#isValidCoords(currentCoords) && moveRemovesCheck(currentCoords)) possibleMoves.push(currentCoords)
      }
    }

    return possibleMoves
  }

  #findMovesAlongRay(board, startCoords, color, opponentControlInformation, moveRemovesCheck, increment) {
    const possibleMoves = []

    if (!opponentControlInformation.hasKingInSingleCheck()) {
      let currentCoords = this.#addDiff(startCoords, increment)
      while (this.#isValidCoords(currentCoords) && board.isEmptySquare(currentCoords)) {
        possibleMoves.push(currentCoords)
        currentCoords = this.#addDiff(currentCoords, increment)
      }

      if (this.#isValidCoords(currentCoords) && board.getPiece(currentCoords).getColor() !== color) {
        possibleMoves.push(currentCoords)
      }
    }

    if (opponentControlInformation.hasKingInSingleCheck()) {
      let currentCoords = this.#addDiff(startCoords, increment)
      while (this.#isValidCoords(currentCoords)
            && board.isEmptySquare(currentCoords)
            && !moveRemovesCheck(currentCoords)) {
        currentCoords = this.#addDiff(currentCoords, increment)
      }

      if (this.#isValidCoords(currentCoords) && moveRemovesCheck(currentCoords)) {
        possibleMoves.push(currentCoords)
      }
    }

    return possibleMoves
  }

  #findMovesAlongMoveLines(board, startCoords, color, opponentControlInformation, moveRemovesCheck) {
    const piece = board.getPiece(startCoords)

    const pieceType = piece.getType()
    if (pieceType !== 'bishop' && pieceType !== 'rook' && pieceType !== 'queen') {
      throw new Error('this method can only be used for queens, rooks, and bishops')
    }

    if (opponentControlInformation.hasKingInDoubleCheck()) {
      return []
    }

    const pinStatus = !piece.isPinned() ? -1 : this.#calcMoveLine(startCoords, piece.getPinOrigin())

    // if pinned, the checking piece can't lie on the path from the king to the pinning piece, because otherwise there would not be a pin
    // moving off of this path to take the checking piece would mean exposing the king to another check, which is not allowed
    // if the checking piece is a bishop, rook, or queen, then the path from it to the king can't intersect the path from the pinning piece to the king (the path not including the king in this case)
    // (if this were possible, it would imply that the king is occupying multiple positions at once, or that there are multiple kings, which is not allowed)
    // thus, it is also not possible for a pinned piece to move to block a check
    // therefore, it follows that a pinned bishop, rook, or queen can't move when the player king is in check
    if (opponentControlInformation.hasKingInSingleCheck() && pinStatus !== -1) {
      return []
    }

    let lineNumberArray
    switch (piece.getType()) {
    case 'bishop':
      if (pinStatus === 0 || pinStatus === 2) lineNumberArray = []
      else if (pinStatus === 1 || pinStatus === 3) lineNumberArray = [pinStatus]
      else lineNumberArray = [1, 3]
      break
    case 'rook':
      if (pinStatus === 1 || pinStatus === 3) lineNumberArray = []
      else if (pinStatus === 0 || pinStatus === 2) lineNumberArray = [pinStatus]
      else lineNumberArray = [0, 2]
      break
    case 'queen':
      if (pinStatus !== -1) lineNumberArray = [pinStatus]
      else lineNumberArray = [0, 1, 2, 3]
      break
    }

    if (lineNumberArray.length === 0) {
      return []
    }

    const lineIncrementList = {
      0: [1, 0],
      1: [1, 1],
      2: [0, 1],
      3: [1, -1],
    }

    const possibleMoves = []

    for (const lineNumber of lineNumberArray) {
      const lineIncrement = lineIncrementList[lineNumber]
      possibleMoves.push(...this.#findMovesAlongRay(board, startCoords, color, opponentControlInformation, moveRemovesCheck, [lineIncrement[0], lineIncrement[1]]))
      possibleMoves.push(...this.#findMovesAlongRay(board, startCoords, color, opponentControlInformation, moveRemovesCheck, [-lineIncrement[0], -lineIncrement[1]]))
    }

    return possibleMoves
  }

  // moveLine 0 is vertical, 1 is from the south west to the north east, 2 is horizontal, and 3 is from south east to north west (direction doesn't matter)

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

  #subtractDiff(coords, diff) {
    return [coords[0] - diff[0], coords[1] - diff[1]]
  }

  #isValidCoords(coords) {
    return coords[0] >= 0 && coords[0] <= 7 && coords[1] >= 0 && coords[1] <= 7
  }

  #validatePieceType(board, coords, pieceType) {
    if (board.getPiece(coords).getType() !== pieceType) {
      throw new Error(`this method can only be used for pieces of type '${pieceType}'`)
    }
  }

  // methods for testing only

  expectMoves(pieceCoords, expectedMoveArray) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    if (this.#MoveBoard[pieceCoords[0]][pieceCoords[1]] === null) {
      throw new Error('There is no player piece occupying the square at the given coordinates')
    }

    const actualMoveArray = this.#MoveBoard[pieceCoords[0]][pieceCoords[1]]

    // the following will mutate the the MoveBoard instance variable by sorting a moveArray, which is currently acceptable for testing purposes

    this.#sortMoveArray(actualMoveArray)
    this.#sortMoveArray(expectedMoveArray)

    if (actualMoveArray.length > expectedMoveArray.length) {
      throw new Error('There are more actual moves than supplied expected moves')
    } else if (actualMoveArray.length < expectedMoveArray.length) {
      throw new Error('There are less actual moves than supplied expected moves')
    } else {
      for (let i = 0; i < actualMoveArray.length; i++) {
        if (!this.#isCoordsEqual(actualMoveArray[i], expectedMoveArray[i])) {
          throw new Error('At least one of the destination coordinates supplied is invalid')
        }
      }
    }

  }

  #sortMoveArray(moveArray) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    moveArray.sort((coords1, coords2) => {
      if (coords1[0] < coords2[0]) {
        return -1
      } else if (coords1[0] > coords2[0]) {
        return 1
      } else {
        if (coords1[1] < coords2[1]) {
          return -1
        } else if (coords1[1] > coords2[1]) {
          return 1
        } else {
          throw new Error('Coordinates appear twice in movelist')
        }
      }
    })
  }

}

module.exports = PlayerMovementInformation
