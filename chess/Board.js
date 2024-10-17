const Piece = require('./Piece')
const Square = require('./Square')
const utils = require('./utils')

class Board {

  #board

  constructor() {
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
      this.#board[6][i].setPiece(newWhitePawn)
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

  #getSquare(coords) {
    return this.#board[coords[0]][coords[1]]
  }

  static #validateCoordinates = utils.validateCoordinates
}

module.exports = Board