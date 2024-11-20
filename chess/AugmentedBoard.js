const Board = require('./board-components/Board')
const PieceList = require('./board-components/PieceList')
const utils = require('./utils')

// This class will not duplicate validations done in imported classes

class AugmentedBoard {

  #test
  #board
  #whitePieceList
  #blackPieceList

  constructor(test = undefined) {
    utils.validateTestParameter(test)
    this.#test = test === 'test'

    this.#board = new Board(test)
    this.#whitePieceList = new PieceList(this.#board, 'white', test)
    this.#blackPieceList = new PieceList(this.#board, 'black', test)
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

  // methods for testing only

  // responsibility for ensuring that pieces are not set to multiple squares is given to the tester
  setPiece(piece, coords) {
    if (!this.#test) {
      throw new Error('This method is only available while in testing mode. Instantiate a new board with a \'test\' argument to access it')
    }

    this.#board.setPiece(piece, coords)

    const pieceColor = this.#getPieceColor(coords)

    if (pieceColor === 'white') {
      this.#whitePieceList.setPiece(piece, coords)
    } else {
      this.#blackPieceList.setPiece(piece, coords)
    }
  }

  // this method should be used immediately after instantiating a board
  /* the moveList takes an array as argument, with each entry containing an array with two coordinate elements representing a piece
  and on its start position and where it should move to. Ensuring that start positions do not appear multiple times and end positions
  do not appear multiple times is currently the responsibility of whoever is writing the test */
  initialiseBoard(moveList) {
    if (!this.#test) {
      throw new Error('This method is only available while in testing mode. Instantiate a new board with a \'test\' argument to access it')
    }

    const pieces = []

    for (const move of moveList) {
      pieces.push(this.getPiece(move[0]))
    }

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        if (!this.isEmptySquare([i, j])) {
          this.removePiece([i, j])
        }
      }
    }

    let i = 0
    for (const piece of pieces) {
      this.setPiece(piece, moveList[i][1])
      i++
    }
  }
}

module.exports = AugmentedBoard