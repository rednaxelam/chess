const Piece = require('./Piece')
const Square = require('./Square')

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
      this.#board[1][i] = newWhitePawn

      let newBlackPawn = new Piece(16 + i, 'pawn')
      this.#board[6][i] = newBlackPawn
    }

    const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

    for (let i = 0; i <= 7; i++) {
      let newWhitePiece = new Piece(8 + i, pieceOrder[i])
      this.#board[0][i] = newWhitePiece

      let newBlackPiece = new Piece(24 + i, pieceOrder[i])
      this.#board[7][i] = newBlackPiece
    }
  }

}

module.exports = Board