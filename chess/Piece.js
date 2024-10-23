class Piece {

  static #validPieceTypes = new Set(['bishop', 'king', 'knight', 'pawn', 'queen', 'rook'])
  static #validPromotionTypes = new Set(['bishop', 'knight', 'queen', 'rook'])
  static #existingIds = new Set()

  #id = null
  #moveCount = null
  #type = null
  #isEnPassantable = null
  #isPinned = null

  constructor(id, type) {
    if (!Piece.#validPieceTypes.has(type)) {
      throw new Error('invalid piece type')
    } else if (!Number.isInteger(id)) {
      throw new Error('id must be an integer')
    } else if (id < 0 || id > 31 ) {
      throw new Error('id not an integer between 0 and 31')
    } else if (Piece.#existingIds.has(id)) {
      throw new Error('id has already been assigned to another piece')
    }

    Piece.#existingIds.add(id)

    this.#id = id
    this.#moveCount = 0
    this.#type = type
    this.#isEnPassantable = false
    this.#isPinned = false
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

  setIsPinned(isPinned) {
    if (typeof isPinned !== 'boolean') {
      throw new Error('Method requires a boolean argument')
    }

    this.#isPinned = isPinned
  }

  isPinned() {
    return this.#isPinned
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
