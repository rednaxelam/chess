const AugmentedBoard = require('./AugmentedBoard')
const OpponentControlInformation = require('./OpponentControlInformation')
const PlayerMovementInformation = require('./PlayerMovementInformation')
const utils = require('./utils')

class ChessGame {

  #board
  #playerMovementInformation
  #gameStatus = 0
  #color = 'white'
  #moveHistory = []
  #fiftyMoveRuleCounter = 0
  #test

  constructor(test = undefined) {
    utils.validateTestParameter(test)
    this.#test = test === 'test'

    this.#board = new AugmentedBoard(test)
    const opponentControlInformation = new OpponentControlInformation(this.#board, 'black')
    this.#playerMovementInformation = new PlayerMovementInformation(this.#board, opponentControlInformation)
  }

  playMove(from, to, promoteTo) {
    if (!this.isActiveGame()) {
      return
    }

    if (!this.#isValidCoords(from)
        || !this.#isValidCoords(to)
        || this.#isCoordsEqual(from, to)
        || this.#board.isEmptySquare(from)
        || this.#board.getPiece(from).getColor() !== this.#color
        || !this.#playerMovementInformation.isValidMove(from, to)) {
      this.#gameStatus = this.#color === 'white' ? 2 : 3
      return
    }

    const piece = this.#board.getPiece(from)

    if (piece.getType() === 'pawn') {
      const pawnIsAtBackRank = this.#color === 'white' ? to[0] === 7 : to[0] === 0
      const isValidPromotionType = promoteTo === 'queen' || promoteTo === 'knight' || promoteTo === 'bishop' || promoteTo === 'rook'
      if (!isValidPromotionType && pawnIsAtBackRank) {
        this.#gameStatus = this.#color === 'white' ? 2 : 3
        return
      }
    }

    this.#resetAllStatusEffects()

    if (piece.getType() === 'pawn') {
      this.#movePawn(from, to, promoteTo)
    } else if (piece.getType() === 'king') {
      this.#moveKing(from, to)
    } else {
      if (!this.#board.isEmptySquare(to)) {
        this.#board.removePiece(to)
        this.#board.movePiece(from, to)
        this.#resetFiftyMoveRuleCounter()
      } else {
        this.#board.movePiece(from, to)
        this.#incrementFiftyMoveRuleCounter()
      }
    }

    this.#moveHistory.push([[from[0], from[1]], [to[0], to[1]]])

    const opponentControlInformation = new OpponentControlInformation(this.#board, this.#color)
    this.#playerMovementInformation = new PlayerMovementInformation(this.#board, opponentControlInformation)
    this.#color = this.#color === 'white' ? 'black' : 'white'

    if (!this.#playerMovementInformation.hasValidMoves()) {
      if (opponentControlInformation.hasKingInSingleCheck() || opponentControlInformation.hasKingInDoubleCheck()) {
        this.#gameStatus = this.#color === 'white' ? 5 : 4
        return
      } else {
        this.#gameStatus = 11
        return
      }
    }

    if (this.#fiftyMoveRuleCounter === 100) {
      this.#gameStatus = 12
      return
    }

    this.#gameStatus = this.#color === 'white' ? 0 : 1
  }

  isActiveGame() {
    return this.#gameStatus <= 3
  }

  getGameStatus() {
    // Status code guide:

    // 0 - White to play
    // 1 - Black to play
    // 2 - White to play, previous move rejected
    // 3 - Black to play, previous move rejected
    // 4 - White win via checkmate
    // 5 - Black win via checkmate
    // 6 - White win via resignation
    // 7 - Black win via resignation
    // 8 - White win via timeout
    // 9 - Black win via timeout
    // 10 - Draw via agreement
    // 11 - Draw via stalemate
    // 12 - Draw via fifty-move rule

    return this.#gameStatus
  }

  getBoardRepresentation() {
    const addPiecesToBoard = (board, pieceList) => {
      let continueFlag = true

      while (continueFlag) {
        const pieceElement = pieceList.popCurrentPieceElement()
        const piece = pieceElement.piece
        const coords = pieceElement.coords

        board[coords[0]][coords[1]] = piece.getType()

        continueFlag = pieceList.hasNextPieceElement()
      }
    }

    const board = new Array(8).fill(undefined).map(() => new Array(8).fill(null))
    const whitePieceList = this.#board.getWhitePieceListIterable()
    const blackPieceList = this.#board.getBlackPieceListIterable()

    addPiecesToBoard(board, whitePieceList)
    addPiecesToBoard(board, blackPieceList)

    return board
  }

  whiteResigns() {
    if (!this.isActiveGame()) return

    this.#gameStatus = 7
  }

  blackResigns() {
    if (!this.isActiveGame()) return

    this.#gameStatus = 6
  }

  whiteTimeout() {
    if (!this.isActiveGame()) return

    this.#gameStatus = 9
  }

  blackTimeout() {
    if (!this.isActiveGame()) return

    this.#gameStatus = 8
  }

  drawViaAgreement() {
    if (!this.isActiveGame()) return

    this.#gameStatus = 10
  }

  #resetAllStatusEffects() {
    const resetStatusEffects = (pieceList) => {
      let continueFlag = true

      while (continueFlag) {
        const pieceElement = pieceList.popCurrentPieceElement()
        const piece = pieceElement.piece

        piece.resetStatusEffects()

        continueFlag = pieceList.hasNextPieceElement()
      }
    }

    const whitePieceList = this.#board.getWhitePieceListIterable()
    const blackPieceList = this.#board.getBlackPieceListIterable()

    resetStatusEffects(whitePieceList)
    resetStatusEffects(blackPieceList)
  }

  #movePawn(from, to, promoteTo) {
    if (from[1] === to[1]) {
      this.#board.movePiece(from, to)
    } else if (!this.#board.isEmptySquare(to)) {
      this.#board.removePiece(to)
      this.#board.movePiece(from, to)
    } else {
      const increment = this.#color === 'white' ? [-1, 0] : [1, 0]
      const enPassantablePawnCoords = this.#addDiff(to, increment)
      this.#board.removePiece(enPassantablePawnCoords)
      this.#board.movePiece(from, to)
    }

    const pawnIsAtBackRank = this.#color === 'white' ? to[0] === 7 : to[0] === 0
    if (pawnIsAtBackRank) {
      this.#board.promotePiece(to, promoteTo)
    }

    if (Math.abs(to[0] - from[0]) === 2) {
      this.#board.getPiece(to).setIsEnPassantable(true)
    }

    this.#resetFiftyMoveRuleCounter()
  }

  #moveKing(from, to) {
    if (Math.abs(to[1] - from[1]) === 2) {
      const isQueensideCastle = to[1] - from[1] === -2
      const c0 = this.#color === 'white' ? 0 : 7

      this.#board.movePiece(from, to)
      if (isQueensideCastle) {
        this.#board.movePiece([c0, 0], [c0, 3])
      } else {
        this.#board.movePiece([c0, 7], [c0, 5])
      }

      this.#incrementFiftyMoveRuleCounter()
    } else {
      if (!this.#board.isEmptySquare(to)) {
        this.#board.removePiece(to)
        this.#board.movePiece(from, to)

        this.#resetFiftyMoveRuleCounter()
      } else {
        this.#board.movePiece(from, to)

        this.#incrementFiftyMoveRuleCounter()
      }
    }
  }

  #isCoordsEqual(coords1, coords2) {
    return coords1[0] === coords2[0] && coords1[1] === coords2[1]
  }

  #isValidCoords(coords) {
    return coords[0] >= 0 && coords[0] <= 7 && coords[1] >= 0 && coords[1] <= 7
  }

  #addDiff(coords, diff) {
    return [coords[0] + diff[0], coords[1] + diff[1]]
  }

  #incrementFiftyMoveRuleCounter() {
    this.#fiftyMoveRuleCounter += 1
  }

  #resetFiftyMoveRuleCounter() {
    this.#fiftyMoveRuleCounter = 0
  }

  // methods for testing only

  expectGameStatus(expectedGameStatus) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    if (this.#gameStatus !== expectedGameStatus) {
      throw new Error(`Expected game status ${expectedGameStatus} does not match actual game status ${this.#gameStatus}`)
    }
  }

  expectPieceIdsAtCoords(coordsIdArray) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    for (const coordsId of coordsIdArray) {
      const coords = coordsId[0]
      const expectedId = coordsId[1]

      if (this.#board.isEmptySquare(coords)) {
        throw new Error(`Piece with id ${expectedId} does not occupy the empty square at [${coords[0]}, ${coords[1]}]`)
      } else if (this.#board.getPiece(coords).getId() !== expectedId) {
        throw new Error(`Piece with id ${expectedId} expected to occupy square at [${coords[0]}, ${coords[1]}], 
          actual occupying piece id is ${this.#board.getPiece(coords).getId()}`)
      }
    }
  }

  expectTypesAtCoords(coordsTypeArray) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    for (const coordsType of coordsTypeArray) {
      const coords = coordsType[0]
      const expectedType = coordsType[1]

      if (this.#board.isEmptySquare(coords)) {
        throw new Error(`Piece with type ${expectedType} does not occupy the empty square at [${coords[0]}, ${coords[1]}]`)
      } else if (this.#board.getPiece(coords).getType() !== expectedType) {
        throw new Error(`Piece with type ${expectedType} expected to occupy square at [${coords[0]}, ${coords[1]}], 
          actual type of occupying piece is ${this.#board.getPiece(coords).getType()}`)
      }
    }
  }

  expectEmptySquares(coordsArray) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    for (const coords of coordsArray) {
      if (!this.#board.isEmptySquare(coords)) {
        throw new Error(`Occupied square at [${coords[0]}, ${coords[1]}] was expected to be empty, but is actually occupied`)
      }
    }
  }

  expectGameStatusesAfterMoves(moveGameStatusArray) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    for (const moveGameStatus of moveGameStatusArray) {
      const move = moveGameStatus[0]
      const expectedGameStatus = moveGameStatus[1]

      this.playMove(move[0], move[1])

      if (this.getGameStatus() !== expectedGameStatus) {
        throw new Error(`Expected game status ${expectedGameStatus} does not match actual game status ${this.getGameStatus()}. 
          This occurred after the move from [${move[0][0]}, ${move[0][1]}] to [${move[1][0]}, ${move[1][1]}]`)
      }
    }
  }

  expectPiecesRemoved(idArray) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    for (const id of idArray) {
      const pieceList = id <= 15 ? this.#board.getWhitePieceListIterable() : this.#board.getBlackPieceListIterable()

      let continueFlag = true

      while (continueFlag) {
        const pieceElement = pieceList.popCurrentPieceElement()
        const piece = pieceElement.piece

        if (piece.getId() === id) {
          throw new Error(`Piece with id ${id} was expected to have been removed, but is actually still on the board`)
        }

        continueFlag = pieceList.hasNextPieceElement()
      }
    }


  }

  // this method assumes that initialisation of the board happens immediately after creation of the ChessGame instance, and that
  // the player has valid moves after initialisation of the board
  initialiseBoard(moveList, color, moveCountList) {
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    if (color !== 'black' && color !== 'white') throw new Error('color argument to initialiseBoard must be either black or white')
    this.#color = color
    this.#gameStatus = color === 'white' ? 0 : 1
    const opponentColor = color === 'white' ? 'black' : 'white'

    this.#board.initialiseBoard(moveList)

    if (moveCountList) {
      for (const moveCountElement of moveCountList) {
        const piece = this.#board.getPiece(moveCountElement[0])
        const moveCount = moveCountElement[1]
        for (let i = 0; i < moveCount; i++) {
          piece.incrementMoveCount()
        }
      }
    }

    const opponentControlInformation = new OpponentControlInformation(this.#board, opponentColor)
    this.#playerMovementInformation = new PlayerMovementInformation(this.#board, opponentControlInformation)
  }
}

module.exports = ChessGame