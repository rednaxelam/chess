const utils = require('../utils')

class Piece {

  static #validPieceTypes = new Set(['bishop', 'king', 'knight', 'pawn', 'queen', 'rook'])
  static #validPromotionTypes = new Set(['bishop', 'knight', 'queen', 'rook'])

  #id = null
  #moveCount = 0
  #type = null
  #isEnPassantable = false
  #pinningPiece = null
  #pinOrigin = null

  constructor(id, type) {
    if (!Piece.#validPieceTypes.has(type)) {
      throw new Error('invalid piece type')
    } else if (!Number.isInteger(id)) {
      throw new Error('id must be an integer')
    } else if (id < 0 || id > 31 ) {
      throw new Error('id not an integer between 0 and 31')
    }

    this.#id = id
    this.#type = type
  }

  getId() {
    return this.#id
  }

  getColor() {
    return this.#id <= 15 ? 'white' : 'black'
  }

  incrementMoveCount() {
    this.#moveCount = this.#moveCount + 1
  }

  getMoveCount() {
    return this.#moveCount
  }

  getType() {
    return this.#type
  }

  setIsEnPassantable(isEnPassantable) {
    if (typeof isEnPassantable !== 'boolean') {
      throw new Error('Method requires a boolean argument')
    }

    this.#isEnPassantable = isEnPassantable
  }

  isEnPassantable() {
    return this.#isEnPassantable
  }

  isPinned() {
    return this.#pinningPiece !== null
  }

  setPinningPiece(piece) {
    if (!(piece instanceof Piece)) {
      throw new Error('Argument must be of type Piece')
    }

    if ((this.#id <= 15 && piece.#id <= 15) || (this.#id >= 16 && piece.#id >= 16)) {
      throw new Error('Piece can not be pinned by another piece of the same color')
    }

    if (piece.#type !== 'rook' && piece.#type !== 'bishop' && piece.#type !== 'queen') {
      throw new Error('Piece can only be pinned by a piece of type queen, rook, or bishop')
    }

    this.#pinningPiece = piece
  }

  getPinningPiece() {
    if (this.#pinningPiece) {
      return this.#pinningPiece
    } else {
      throw new Error('There is no piece pinning this piece')
    }
  }

  setPinOrigin(coords) {
    utils.validateCoordinates(coords)

    this.#pinOrigin = coords
  }

  getPinOrigin() {
    if (this.#pinOrigin) {
      return [this.#pinOrigin[0], this.#pinOrigin[1]]
    } else {
      throw new Error('There is no piece pinning this piece')
    }
  }

  resetStatusEffects() {
    this.#isEnPassantable = false
    this.#pinningPiece = null
    this.#pinOrigin = null
  }

  promoteTo(newType) {
    if (this.#type !== 'pawn') {
      throw new Error('only pawns can be promoted')
    }

    if (!Piece.#validPromotionTypes.has(newType)) {
      throw new Error(`not possible to promote pawn to ${newType}`)
    }

    this.#type = newType
  }
}

module.exports = Piece
