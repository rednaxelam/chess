const ChessGame = require('game-logic').ChessGame
const { v7: uuidv7 } = require('uuid')

// it is assumed that the following assumption will be enforced in application code using OnlineGame:
//  - only users who are part of the game will be able to interact with it

class OnlineGame {

  #gameId = uuidv7()
  #chessGame = new ChessGame()
  #whitePlayerId
  #blackPlayerId
  #drawAgreementArray = [false, false]
  #wantsDrawOffers = [true, true]
  #gameStateHasChanged = true
  #gameStateHasNotChangedReasonCode = null
  #version = {
    gameState: 0,
  }

  constructor(userId1, userId2) {
    if (Math.random() < 0.5) {
      this.#whitePlayerId = userId1
      this.#blackPlayerId = userId2
    } else {
      this.#whitePlayerId = userId2
      this.#blackPlayerId = userId1
    }
  }

  // methods to interact with active game

  playMove(playerId, moveInfo, gameStateVersion) {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    const playerColor = this.#getPlayerColor(playerId)

    if (!this.#doesClientHaveLatestVersion('gameState', gameStateVersion)) {
      this.#gameStateHasChanged = false
      this.#gameStateHasNotChangedReasonCode = 4 // internal game state version does not match version supplied
      return
    }
    
    let gameStatus = this.#chessGame.getGameStatus()

    if (playerColor === 'white' && gameStatus % 2 === 1) {
      this.#gameStateHasChanged = false
      this.#gameStateHasNotChangedReasonCode = 0 // white attempted to move on black turn
      return
    } else if (playerColor === 'black' && gameStatus % 2 === 0) {
      this.#gameStateHasChanged = false
      this.#gameStateHasNotChangedReasonCode = 1 // black attempted to move on white turn
      return
    } else {
      if (moveInfo === null || moveInfo === undefined) {
        this.#gameStateHasChanged = false
        this.#gameStateHasNotChangedReasonCode = 2 // move supplied was not valid
        return
      }
      const { from, to, promoteTo } = moveInfo
      this.#chessGame.playMove(from, to, promoteTo)

      gameStatus = this.#chessGame.getGameStatus()
      if (gameStatus === 2 || gameStatus === 3) {
        this.#gameStateHasChanged = false
        this.#gameStateHasNotChangedReasonCode = 2 // move supplied was not valid
      } else {
        this.#gameStateHasChanged = true
        this.#gameStateHasNotChangedReasonCode = null
        this.#version.gameState++
      }
    }
  }

  playerOffersDraw(playerId) {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    if (this.isDrawOffersDisabled()) {
      this.#inconclusiveDrawActionHasBeenMade()
      return
    }

    const playerColor = this.#getPlayerColor(playerId)
    
    if (playerColor === 'white') {
      this.#drawAgreementArray[0] = true
    } else {
      this.#drawAgreementArray[1] = true
    }

    if (this.#drawAgreementArray[0] && this.#drawAgreementArray[1]) {
      this.#gameStateHasChanged = true
      this.#gameStateHasNotChangedReasonCode = null
      this.#chessGame.drawViaAgreement()
    } else {
      this.#inconclusiveDrawActionHasBeenMade()
    }
  }

  playerResetsDrawAgreement() {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    this.#resetDrawAgreementArray()

    this.#inconclusiveDrawActionHasBeenMade()
  }

  playerDoesNotWantDrawOffers(playerId) {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    const playerColor = this.#getPlayerColor(playerId)

    this.#resetDrawAgreementArray()

    if (playerColor === 'white') {
      this.#wantsDrawOffers[0] = false
    } else {
      this.#wantsDrawOffers[1] = false
    }

    this.#inconclusiveDrawActionHasBeenMade()
  }

  playerWantsDrawOffers(playerId) {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    const playerColor = this.#getPlayerColor(playerId)

    this.#resetDrawAgreementArray()

    if (playerColor === 'white') {
      this.#wantsDrawOffers[0] = true
    } else {
      this.#wantsDrawOffers[1] = true
    }

    this.#inconclusiveDrawActionHasBeenMade()
  }

  playerResigns(playerId) {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    const playerColor = this.#getPlayerColor(playerId)

    if (playerColor === 'white') {
      this.#chessGame.whiteResigns()
    } else {
      this.#chessGame.blackResigns()
    }

    this.#gameStateHasChanged = true
    this.#gameStateHasNotChangedReasonCode = null
  }

  playerAbandons(playerId) {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    const playerColor = this.#getPlayerColor(playerId)

    if (playerColor === 'white') {
      this.#chessGame.whiteAbandonsGame()
    } else {
      this.#chessGame.blackAbandonsGame()
    }

    this.#gameStateHasChanged = true
    this.#gameStateHasNotChangedReasonCode = null
  }

  playerTimeout(playerId) {
    if (!this.isActiveGame()) {this.#gameIsFinishedStatusUpdate(); return}
    const playerColor = this.#getPlayerColor(playerId)

    if (playerColor === 'white') {
      this.#chessGame.whiteTimeout()
    } else {
      this.#chessGame.blackTimeout()
    }

    this.#gameStateHasChanged = true
    this.#gameStateHasNotChangedReasonCode = null
  }

  // methods to get state representing the status of the game

  getCurrentGameState(playerId) {
    const playerColor = this.#getPlayerColor(playerId)
    const currentGameStateRepresentation = this.#chessGame.getCurrentGameStateRepresentation()
    
    currentGameStateRepresentation.playerColor = playerColor

    return currentGameStateRepresentation
  }

  getCurrentDrawAgreementState() {
    return {
      white: {
        offersDraw: this.#drawAgreementArray[0],
        wantsDrawOffers: this.#wantsDrawOffers[0],
      },
      black: {
        offersDraw: this.#drawAgreementArray[1],
        wantsDrawOffers: this.#wantsDrawOffers[1],
      },
    }
  }

  gameStateHasChanged() {
    return this.#gameStateHasChanged
  }

  getGameStateHasNotChangedReasonCode() {
    // Status code guide:

    // 0 - white attempted to move on black turn
    // 1 - black attempted to move on white turn
    // 2 - move supplied was not valid
    // 3 - draw related action that does not change the game state
    // 4 - internal game state version does not match version supplied (client state is likely out of sync)
    // 5 - game has finished and no further actions can be taken
    return this.#gameStateHasNotChangedReasonCode
  }

  isActiveGame() {
    return this.#chessGame.isActiveGame()
  }

  isDrawOffersDisabled() {
    if (this.isActiveGame()) {
      return !(this.#wantsDrawOffers[0] && this.#wantsDrawOffers[1])
    } else {
      return true
    }    
  }

  getGameId() {
    return this.#gameId
  }

  getUsers() {
    return {
      white: this.#whitePlayerId,
      black: this.#blackPlayerId,
    }
  }

  isUserPartOfGame(playerId) {
    return playerId === this.#whitePlayerId || playerId === this.#blackPlayerId
  }

  // helper methods

  #resetDrawAgreementArray() {
    this.#drawAgreementArray[0] = false
    this.#drawAgreementArray[1] = false
  }

  #getPlayerColor(playerId) {
    if (this.#whitePlayerId === playerId) {
      return 'white'
    } else {
      return 'black'
    }
  }

  #doesClientHaveLatestVersion(stateType, version) {
    return version === this.#version[stateType]
  }

  #inconclusiveDrawActionHasBeenMade() {
    this.#gameStateHasChanged = false
    this.#gameStateHasNotChangedReasonCode = 3 // draw related action that does not change the game state
  }

  #gameIsFinishedStatusUpdate() {
    this.#gameStateHasChanged = false
    this.#gameStateHasNotChangedReasonCode = 5 // game has finished and no further actions can be taken
  }

}

module.exports = {
  OnlineGame
}