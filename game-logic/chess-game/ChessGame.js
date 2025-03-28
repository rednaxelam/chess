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
  #whitePositionHistory = []
  #blackPositionHistory = []
  #playerKingIsInCheck = false
  #castlingRights = { whiteQueenside: true, whiteKingside: true, blackQueenside: true, blackKingside: true }
  #test

  constructor(test = undefined) {
    utils.validateTestParameter(test)
    this.#test = test === 'test'

    this.#board = new AugmentedBoard(test)
    const opponentControlInformation = new OpponentControlInformation(this.#board, 'black')
    this.#playerMovementInformation = new PlayerMovementInformation(this.#board, opponentControlInformation)

    this.#addAndComparePositionToPositionHistory()
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
        this.#clearPositionHistory()
      } else {
        this.#board.movePiece(from, to)
        this.#incrementFiftyMoveRuleCounter()
      }
    }

    this.#moveHistory.push([[from[0], from[1]], [to[0], to[1]]])

    const opponentControlInformation = new OpponentControlInformation(this.#board, this.#color)
    this.#playerMovementInformation = new PlayerMovementInformation(this.#board, opponentControlInformation)
    this.#color = this.#color === 'white' ? 'black' : 'white'
    this.#playerKingIsInCheck = opponentControlInformation.hasKingInSingleCheck() || opponentControlInformation.hasKingInDoubleCheck()

    if (!this.#playerMovementInformation.hasValidMoves()) {
      if (this.#playerKingIsInCheck) {
        this.#gameStatus = this.#color === 'white' ? 5 : 4
        return
      } else {
        this.#gameStatus = 13
        return
      }
    }

    this.#addAndComparePositionToPositionHistory(piece, from, to)
    if (!this.isActiveGame()) return

    if (this.#fiftyMoveRuleCounter === 100) {
      this.#gameStatus = 14
      return
    }

    if (this.#bothPlayersHaveInsufficientMaterial()) {
      this.#gameStatus = 16
      return
    }

    this.#gameStatus = this.#color === 'white' ? 0 : 1
  }

  isActiveGame() {
    return this.#gameStatus <= 3
  }

  getGameStatus() {
    // Status code guide:

    //  0 - White to play
    //  1 - Black to play
    //  2 - White to play, previous move rejected
    //  3 - Black to play, previous move rejected
    //  4 - White win via checkmate
    //  5 - Black win via checkmate
    //  6 - White win via resignation
    //  7 - Black win via resignation
    //  8 - White win via timeout
    //  9 - Black win via timeout
    // 10 - White win via abandonment
    // 11 - Black win via abandonment
    // 12 - Draw via agreement
    // 13 - Draw via stalemate
    // 14 - Draw via fifty-move rule
    // 15 - Draw via threefold repetition
    // 16 - Draw via insufficient material
    // 17 - Draw via timeout vs insufficient material

    return this.#gameStatus
  }

  isPlayerToMoveInCheck() {
    return this.#playerKingIsInCheck
  }

  getCurrentGameStateRepresentation() {
    const getPieceInfo = (pieceList, isPlayerToMove) => {
      const pieceInfo = {}
      let continueFlag = true
      while (continueFlag) {
        const pieceElement = pieceList.popCurrentPieceElement()
        const piece = pieceElement.piece
        const coords = pieceElement.coords
        const type = piece.getType()
        const pieceId = piece.getId()
        const possibleMoves = isPlayerToMove ? this.#playerMovementInformation.getMoveArrayCopy(coords) : null

        pieceInfo[pieceId] = {
          coords,
          type,
          possibleMoves
        }

        continueFlag = pieceList.hasNextPieceElement()
      }

      return pieceInfo
    }

    const whitePieceList = this.#board.getWhitePieceListIterable()
    const blackPieceList = this.#board.getBlackPieceListIterable()

    const currentGameStateRepresentation = {
      gameStatus: this.#gameStatus,
      playerToMoveColor: this.#color,
      playerToMoveIsInCheck: this.#playerKingIsInCheck,
      whitePieceInfo: getPieceInfo(whitePieceList, this.#color === 'white'),
      blackPieceInfo: getPieceInfo(blackPieceList, this.#color === 'black'),
    }

    return currentGameStateRepresentation
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

    if (this.#playerHasInsufficientMaterialAfterTimeout('black')) {
      this.#gameStatus = 17
    } else {
      this.#gameStatus = 9
    }
  }

  blackTimeout() {
    if (!this.isActiveGame()) return

    if (this.#playerHasInsufficientMaterialAfterTimeout('white')) {
      this.#gameStatus = 17
    } else {
      this.#gameStatus = 8
    }

  }

  whiteAbandonsGame() {
    if (!this.isActiveGame()) return

    this.#gameStatus = 11
  }

  blackAbandonsGame() {
    if (!this.isActiveGame()) return


    this.#gameStatus = 10
  }

  drawViaAgreement() {
    if (!this.isActiveGame()) return

    this.#gameStatus = 12
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
    this.#clearPositionHistory()
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
        this.#clearPositionHistory()
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

  #clearPositionHistory() {
    this.#blackPositionHistory = []
    this.#whitePositionHistory = []
  }

  #getCurrentPiecePosition() {
    const getCoordsTypeList = (pieceList) => {
      const coordsTypeList = []
      let continueFlag = true
      while (continueFlag) {
        const pieceElement = pieceList.popCurrentPieceElement()
        const coords = pieceElement.coords
        const type = pieceElement.piece.getType()
        coordsTypeList.push({ coords, type })

        continueFlag = pieceList.hasNextPieceElement()
      }
      return coordsTypeList
    }

    const whitePieceList = this.#board.getWhitePieceListIterable()
    const blackPieceList = this.#board.getBlackPieceListIterable()

    const whitePiecePosition = getCoordsTypeList(whitePieceList)
    const blackPiecePosition = getCoordsTypeList(blackPieceList)

    return {
      whitePiecePosition,
      blackPiecePosition,
      count: 1,
    }
  }

  // the following method assumes that:
  //  - positions for each player are stored in a separate history
  //  - no positions where taking via en passant is possible are part of the history
  //  - all positions for both player position histories have the same castling rights
  #isSamePosition(oldPiecePosition, currentPiecePosition) {

    const isSamePiecePosition = (oldPiecePosition, currentPiecePosition) => {
      // position histories are reset after a piece is taken, so equality of length between piece positions doesn't need checking
      for (let i = 0; i < oldPiecePosition.length; i++) {
        const oldPieceInfo = oldPiecePosition[i]
        const oldPieceCoords = oldPieceInfo.coords
        const oldPieceType = oldPieceInfo.type

        const currentPieceInfo = currentPiecePosition[i]
        const currentPieceCoords = currentPieceInfo.coords
        const currentPieceType = currentPieceInfo.type

        // piecelists are sorted by coordinates, and the piece positions take advantage of that to also be sorted by coordinates
        // if a pair of coordinates are not equal, it means that the coordinates the pieces occupy are not the same between the lists
        if ((!this.#isCoordsEqual(oldPieceCoords, currentPieceCoords))
            || (oldPieceType !== currentPieceType)) {
          return false
        }
      }

      return true
    }

    if (!isSamePiecePosition(oldPiecePosition.whitePiecePosition, currentPiecePosition.whitePiecePosition)
        || !isSamePiecePosition(oldPiecePosition.blackPiecePosition, currentPiecePosition.blackPiecePosition)) {
      return false
    }

    return true
  }

  #addAndComparePositionToPositionHistory(piece, from, to) {
    // the following should be run only after a move is played
    if (piece) {
      if (this.#isPositionWithPossibleEnPassant(piece, to)) {
        return
      }

      this.#compareAndAdjustCastlingRights(piece, from)
    }

    const positionHistory = this.#color === 'white' ? this.#whitePositionHistory : this.#blackPositionHistory
    const currentPiecePosition = this.#getCurrentPiecePosition()

    let positionHasAppearedBefore = false
    for (const oldPiecePosition of positionHistory) {
      if (this.#isSamePosition(oldPiecePosition, currentPiecePosition)) {
        positionHasAppearedBefore = true
        oldPiecePosition.count += 1
        if (oldPiecePosition.count === 3) {
          this.#gameStatus = 15
          return
        }
        break
      }
    }

    if (!positionHasAppearedBefore) {
      positionHistory.push(currentPiecePosition)
    }
  }

  #isPositionWithPossibleEnPassant(piece, to) {

    if (piece.isEnPassantable()) {
      const potentialEnPassantFromCoords1 = this.#addDiff(to, [0, -1])
      const potentialEnPassantFromCoords2 = this.#addDiff(to, [0, 1])
      const potentialEnPassantToCoords = this.#color === 'white' ? this.#addDiff(to, [1, 0]) : this.#addDiff(to, [-1, 0])
      if (this.#isValidCoords(potentialEnPassantFromCoords1)
          && this.#playerPawnOccupiesSquare(potentialEnPassantFromCoords1)
          && this.#playerMovementInformation.isValidMove(potentialEnPassantFromCoords1, potentialEnPassantToCoords)) {
        return true
      } else if (this.#isValidCoords(potentialEnPassantFromCoords2)
          && this.#playerPawnOccupiesSquare(potentialEnPassantFromCoords2)
          && this.#playerMovementInformation.isValidMove(potentialEnPassantFromCoords2, potentialEnPassantToCoords)) {
        return true
      }
    }

    return false
  }

  #compareAndAdjustCastlingRights(piece, from) {
    if (piece.getType() === 'rook' && piece.getMoveCount() === 1) {
      if (this.#isCoordsEqual(from, [0, 0]) && this.#castlingRights.whiteQueenside) {
        this.#castlingRights.whiteQueenside = false
        this.#clearPositionHistory()
      } else if (this.#isCoordsEqual(from, [0, 7]) && this.#castlingRights.whiteKingside) {
        this.#castlingRights.whiteKingside = false
        this.#clearPositionHistory()
      } else if (this.#isCoordsEqual(from, [7, 0]) && this.#castlingRights.blackQueenside) {
        this.#castlingRights.blackQueenside = false
        this.#clearPositionHistory()
      } else if (this.#isCoordsEqual(from, [7, 7]) && this.#castlingRights.blackKingside) {
        this.#castlingRights.blackKingside = false
        this.#clearPositionHistory()
      }
    }

    if (piece.getType() === 'king' && piece.getMoveCount() === 1) {
      if (this.#isCoordsEqual(from, [0, 4]) && (this.#castlingRights.whiteQueenside || this.#castlingRights.whiteKingside)) {
        this.#castlingRights.whiteQueenside = false
        this.#castlingRights.whiteKingside = false
        this.#clearPositionHistory()
      } else if (this.#castlingRights.blackQueenside || this.#castlingRights.blackKingside) {
        this.#castlingRights.blackQueenside = false
        this.#castlingRights.blackKingside = false
        this.#clearPositionHistory()
      }
    }
  }

  #playerPawnOccupiesSquare(coords) {
    return (!this.#board.isEmptySquare(coords)
      && this.#board.getPiece(coords).getColor() === this.#color
      && this.#board.getPiece(coords).getType() === 'pawn')
  }

  #bothPlayersHaveInsufficientMaterial() {

    const getPieceTypeArray = (pieceList) => {
      const pieceTypeArray = []
      let continueFlag = true
      while (continueFlag) {
        const pieceType = pieceList.popCurrentPieceElement().piece.getType()
        pieceTypeArray.push(pieceType)
        continueFlag = pieceList.hasNextPieceElement()
      }
      return pieceTypeArray
    }

    const playerOnlyHasKingAndMinorPiece = (pieceTypeArray) => {
      if (pieceTypeArray.length !== 2) {
        return false
      }
      else {
        for (const pieceType of pieceTypeArray) {
          if (pieceType !== 'king' && pieceType !== 'knight' && pieceType !== 'bishop') return false
        }
        return true
      }
    }

    const playerOnlyHasKing = (pieceTypeArray) => {
      return pieceTypeArray.length === 1
    }

    const playerOnlyHasKingAndTwoKnights = (pieceTypeArray) => {
      if (pieceTypeArray.length !== 3) {
        return false
      } else {
        for (const pieceType of pieceTypeArray) {
          if (pieceType !== 'king' && pieceType !== 'knight') return false
        }
        return true
      }
    }

    const whitePieceList = this.#board.getWhitePieceListIterable()
    const blackPieceList = this.#board.getBlackPieceListIterable()

    if (whitePieceList.getLength() > 3 || blackPieceList.getLength() > 3) {
      return false
    }

    const whitePieceTypeArray = getPieceTypeArray(whitePieceList)
    const blackPieceTypeArray = getPieceTypeArray(blackPieceList)

    if ((playerOnlyHasKing(whitePieceTypeArray) || playerOnlyHasKingAndMinorPiece(whitePieceTypeArray))
        && (playerOnlyHasKing(blackPieceTypeArray) || playerOnlyHasKingAndMinorPiece(blackPieceTypeArray))) {
      return true
    } else if ((playerOnlyHasKing(whitePieceTypeArray) && playerOnlyHasKingAndTwoKnights(blackPieceTypeArray))
        || (playerOnlyHasKingAndTwoKnights(whitePieceTypeArray) && playerOnlyHasKing(blackPieceTypeArray))) {
      return true
    } else {
      return false
    }
  }

  #playerHasInsufficientMaterialAfterTimeout(color) {

    const playerPieceList = color === 'white' ? this.#board.getWhitePieceListIterable() : this.#board.getBlackPieceListIterable()

    if (playerPieceList.getLength() > 2) {
      return false
    } else if (playerPieceList.getLength() === 1) {
      return true
    } else {
      let continueFlag = true

      while (continueFlag) {
        const pieceType = playerPieceList.popCurrentPieceElement().piece.getType()
        if (pieceType !== 'king' && pieceType !== 'knight' && pieceType !== 'bishop') return false

        continueFlag = playerPieceList.hasNextPieceElement()
      }
      return true
    }
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
    this.#playerKingIsInCheck = opponentControlInformation.hasKingInSingleCheck() || opponentControlInformation.hasKingInDoubleCheck()

    this.#clearPositionHistory()

    const pieceWithTypeAndColorHasNotMoved = (coords, type, color) => {
      return (!this.#board.isEmptySquare(coords)
          && this.#board.getPiece(coords).getMoveCount() === 0
          && this.#board.getPiece(coords).getType() === type
          && this.#board.getPiece(coords).getColor() === color)
    }

    this.#castlingRights = {
      whiteQueenside: pieceWithTypeAndColorHasNotMoved([0, 4], 'king', 'white') && pieceWithTypeAndColorHasNotMoved([0, 0], 'rook', 'white'),
      whiteKingside: pieceWithTypeAndColorHasNotMoved([0, 4], 'king', 'white') && pieceWithTypeAndColorHasNotMoved([0, 7], 'rook', 'white'),
      blackQueenside: pieceWithTypeAndColorHasNotMoved([7, 4], 'king', 'black') && pieceWithTypeAndColorHasNotMoved([7, 0], 'rook', 'black'),
      blackKingside: pieceWithTypeAndColorHasNotMoved([7, 4], 'king', 'black') && pieceWithTypeAndColorHasNotMoved([7, 7], 'rook', 'black')
    }

    this.#addAndComparePositionToPositionHistory()
  }
}

module.exports = ChessGame