const Board = require('./Board')
const utils = require('../utils')

// this class will be used with the Board class which validates coordinates, so will not validate them again
// the class will also not duplicate other Board validations
// movePiece and other PieceList operations can be optimised if necessary

class PieceList {

  #test
  #pieceList

  constructor(board, color, test = undefined) {
    utils.validateTestParameter(test)
    this.#test = test === 'test'

    if (!(board instanceof Board)) {
      throw new Error('PieceList constructor requires a Board argument')
    }

    this.#pieceList = []

    if (color === 'white') {
      for (let i = 0; i <= 1; i++) {
        for (let j = 0; j <= 7; j++) {
          const piece = board.getPiece([i, j])
          this.#pieceList.push({ coords: [i, j], piece: piece })
        }
      }
    } else if (color === 'black') {
      for (let i = 6; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
          const piece = board.getPiece([i, j])
          this.#pieceList.push({ coords: [i, j], piece: piece })
        }
      }
    } else {
      throw new Error(`Unexpected color value '${color}' provided`)
    }
  }

  movePiece(from, to) {
    const pieceToMoveElement = this.#findPieceElement(from)

    pieceToMoveElement.coords = [to[0], to[1]]

    this.#sortPieceList()
  }

  removePiece(coords) {
    const pieceToRemoveElementIndex = this.#findPieceElementIndex(coords)

    this.#pieceList.splice(pieceToRemoveElementIndex, 1)
  }

  getPieceListIterable() {
    return new PieceListIterable(this.#pieceList)
  }

  #sortPieceList() {
    this.#pieceList.sort((element1, element2) => {
      if (element1.coords[0] < element2.coords[0]) {
        return -1
      } else if (element1.coords[0] > element2.coords[0]) {
        return 1
      } else {
        if (element1.coords[1] < element2.coords[1]) {
          return -1
        } else if (element1.coords[1] > element2.coords[1]) {
          return 1
        } else {
          throw new Error('Two pieces can not have the same coordinates')
        }
      }
    })
  }

  #findPieceElement(coords) {
    const pieceElement = this.#pieceList.find(
      listElement => listElement.coords[0] === coords[0] && listElement.coords[1] === coords[1]
    )

    if (pieceElement === undefined) {
      throw new Error('There is no piece occupying the square with the given coordinates')
    }

    return pieceElement
  }

  #findPieceElementIndex(coords) {
    const pieceElementIndex = this.#pieceList.findIndex(
      listElement => listElement.coords[0] === coords[0] && listElement.coords[1] === coords[1]
    )

    if (pieceElementIndex === -1) {
      throw new Error('There is no piece occupying the square with the given coordinates')
    }

    return pieceElementIndex
  }

  // methods for testing only

  // the responsibility for ensuring that pieces of a different color are not added to the PieceList is given to the tester
  setPiece(piece, coords) {
    coords = [coords[0], coords[1]]
    if (!this.#test) {
      throw new Error('This method is only available in testing mode.')
    }

    this.#pieceList.push({ coords: coords, piece: piece })

    this.#sortPieceList()
  }
}

class PieceListIterable {

  #pieceList
  #currentIndex

  constructor(pieceList) {

    this.#pieceList = []
    this.#currentIndex = 0

    for (let i = 0; i < pieceList.length; i++) {
      const coordsCopy = [pieceList[i].coords[0], pieceList[i].coords[1]]
      this.#pieceList[i] = { coords: coordsCopy, piece: pieceList[i].piece }
    }
  }

  hasNextPieceElement() {
    if (this.#currentIndex > this.#pieceList.length) throw new Error('Current index is higher than length of list')

    return this.#currentIndex !== this.#pieceList.length
  }

  popCurrentPieceElement() {
    if (this.#currentIndex > this.#pieceList.length) throw new Error('Current index is higher than length of list')

    if (this.#currentIndex === this.#pieceList.length) throw new Error('There are no elements remaining in the piece list')

    this.#currentIndex++

    return this.#pieceList[this.#currentIndex - 1]
  }

  reset() {
    this.#currentIndex = 0
  }

  getLength() {
    return this.#pieceList.length
  }

}

module.exports = PieceList