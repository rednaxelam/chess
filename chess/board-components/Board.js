const Piece = require('./Piece')
const Square = require('./Square')
const utils = require('../utils')

class Board {

  #test
  #board

  constructor(test = undefined) {
    utils.validateTestParameter(test)
    this.#test = test === 'test'

    this.#board = []

    for (let i = 0; i <= 7; i++) {
      this.#board[i] = []
      for (let j = 0; j <= 7; j++) {
        this.#board[i][j] = new Square([i, j])
      }
    }

    for (let i = 0; i <= 7; i++) {
      let newWhitePawn = new Piece(i, 'pawn')
      this.#board[1][i].setPiece(newWhitePawn)

      let newBlackPawn = new Piece(16 + i, 'pawn')
      this.#board[6][i].setPiece(newBlackPawn)
    }

    const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

    for (let i = 0; i <= 7; i++) {
      let newWhitePiece = new Piece(8 + i, pieceOrder[i])
      this.#board[0][i].setPiece(newWhitePiece)

      let newBlackPiece = new Piece(24 + i, pieceOrder[i])
      this.#board[7][i].setPiece(newBlackPiece)
    }
  }

  movePiece(from, to) {
    Board.#validateCoordinates(from)
    Board.#validateCoordinates(to)

    if (this.#getSquare(from).isEmptySquare()) {
      throw new Error('There is no piece to move from empty square')
    } else if (!this.#getSquare(to).isEmptySquare()) {
      throw new Error('Not possible to move a piece to a square that is already occupied. Deoccupy the square first')
    }

    const pieceToMove = this.#getSquare(from).popPiece()

    this.#getSquare(to).setPiece(pieceToMove)
  }

  removePiece(coords) {
    Board.#validateCoordinates(coords)

    if (this.#getSquare(coords).isEmptySquare()) {
      throw new Error('Not possible to remove piece from square that has no piece')
    }

    if (this.#getSquare(coords).getPiece().getType() === 'king' && !this.#test) {
      throw new Error('Not possible to remove a king from the board')
    }

    this.#getSquare(coords).popPiece()
  }

  promotePiece(coords, promoteTo) {
    Board.#validateCoordinates(coords)

    if (this.#getSquare(coords).isEmptySquare()) {
      throw new Error('No piece occupying the square, promotion not possible')
    }

    const pieceToPromote = this.#getSquare(coords).getPiece()

    if (pieceToPromote.getType() !== 'pawn') {
      throw new Error('Not possible to promote a piece that is not a pawn')
    } else if (pieceToPromote.getId() >= 0 && pieceToPromote.getId() <= 7) {
      if (coords[0] !== 7) {
        throw new Error('Not possible to promote white pawn that is not at its last rank')
      }
    } else {
      if (coords[0] !== 0) {
        throw new Error('Not possible to promote black pawn that is not at its last rank')
      }
    }

    // Piece validations will throw an error if promoteTo is not a valid value, so that validation is not done here

    pieceToPromote.promoteTo(promoteTo)

  }

  isEmptySquare(coords) {
    Board.#validateCoordinates(coords)

    return this.#getSquare(coords).isEmptySquare()
  }

  getPiece(coords) {
    Board.#validateCoordinates(coords)

    if (this.#getSquare(coords).isEmptySquare()) {
      throw new Error('Not possible to get piece from empty square')
    }

    return this.#getSquare(coords).getPiece()
  }

  #getSquare(coords) {
    return this.#board[coords[0]][coords[1]]
  }

  static #validateCoordinates = utils.validateCoordinates
}

module.exports = Board