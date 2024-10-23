const Board = require('./board-components/Board')
const PieceList = require('./board-components/PieceList')

// This class will not duplicate validations done in imported classes

class AugmentedBoard {

  #board
  #whitePieceList
  #blackPieceList

  constructor() {
    this.#board = new Board()
    this.#whitePieceList = new PieceList(this.#board, 'white')
    this.#blackPieceList = new PieceList(this.#board, 'black')
  }

  movePiece(from, to) {
    const pieceColor = this.#getPieceColor(from)

    this.#board.movePiece(from, to)

    if (pieceColor === 'white') {
      this.#whitePieceList.movePiece(from, to)
    } else {
      this.#blackPieceList.movePiece(from, to)
    }

    this.#board.getPiece(to).incrementMoveCount()
  }

  removePiece(coords) {
    const pieceColor = this.#getPieceColor(coords)

    this.#board.removePiece(coords)

    if (pieceColor === 'white') {
      this.#whitePieceList.removePiece(coords)
    } else {
      this.#blackPieceList.removePiece(coords)
    }
  }

  promotePiece(coords, promoteTo) {
    this.#board.promotePiece(coords, promoteTo)
    /* there is no need to call a corresponding method in the piecelist because the board and piecelists
    refer to the same pieces, and the piece types (i.e. bishop, pawn, etc.) are stored in pieces*/
  }

  isEmptySquare(coords) {
    return this.#board.isEmptySquare(coords)
  }

  getPiece(coords) {
    return this.#board.getPiece(coords)
  }

  getWhitePieceListIterable() {
    return this.#whitePieceList.getPieceListIterable()
  }

  getBlackPieceListIterable() {
    return this.#blackPieceList.getPieceListIterable()
  }

  #getPieceColor(coords) {
    return this.#board.getPiece(coords).getColor()
  }
}

module.exports = AugmentedBoard