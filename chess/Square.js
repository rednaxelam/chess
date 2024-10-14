const Piece = require('./Piece')

class Square {

  #piece

  constructor(coordinates) {
    // the following checks are to help validate that the board is created in a way that you would expect
    if (!Array.isArray(coordinates)) {
      throw new Error('coordinates must be supplied as an array')
    } else if (coordinates.length !== 2) {
      throw new Error('coordinates must be an array of length 2')
    } else if (!Number.isInteger(coordinates[0]) || !Number.isInteger(coordinates[1])) {
      throw new Error('coordinates must be integers')
    } else if (coordinates[0] < 0 || coordinates[0] > 7 || coordinates[1] < 0 || coordinates[1] > 7) {
      throw new Error('coordinates for x and y values must be between 0 and 7')
    }

    this.#piece = null

  }

  isEmptySquare() {
    return this.#piece === null
  }

  getPiece() {
    /* if a piece is expected to be on a square which it is not, then it is highly likely that there is an error
    in the code that must be addressed */
    if (this.#piece === null) {
      throw new Error('there is no piece occupying the given square')
    }

    return this.#piece
  }

  setPiece(piece) {
    if (!(piece instanceof Piece)) {
      throw new Error('piece supplied as argument is not an instance of Piece')
    }

    // if a piece should be removed from the board, it should happen explicitly rather than implicitly
    if (this.#piece !== null) {
      throw new Error('square already has a piece occupying it')
    }

    this.#piece = piece
  }

  popPiece() {
    if (this.#piece === null) {
      throw new Error('there is no piece occupying the given square')
    }

    const piece = this.#piece
    this.#piece = null
    return piece
  }

}

module.exports = Square
