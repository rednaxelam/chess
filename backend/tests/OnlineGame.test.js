const { OnlineGame } = require('../services/OnlineGame')
const { v7: uuidv7 } = require('uuid')

let onlineGameSetupContainer

describe('OnlineGame Testing', () => {
  test('Game is created and users assigned colors during construction', () => {
    const user1 = uuidv7()
    const user2 = uuidv7()
    const onlineGame = new OnlineGame(user1, user2)

    expect(onlineGame.isActiveGame()).toBe(true)
    expect(onlineGame.gameStateHasChanged()).toBe(true)
    expect(['white', 'black']).toContain(onlineGame.getCurrentGameState(user1).playerColor)
    expect(['white', 'black']).toContain(onlineGame.getCurrentGameState(user2).playerColor)
    expect(onlineGame.getCurrentGameState(user1).playerColor).not.toBe(onlineGame.getCurrentGameState(user2).playerColor)
  })

  describe('When in an active game', () => {
    beforeEach(() => {
      const user1 = uuidv7()
      const user2 = uuidv7()
      const onlineGame = new OnlineGame(user1, user2)

      const whitePlayerId = onlineGame.getCurrentGameState(user1).playerColor === 'white' ? user1 : user2
      const blackPlayerId = user1 === whitePlayerId ? user2 : user1
      
      onlineGameSetupContainer = {
        onlineGame,
        whitePlayerId,
        blackPlayerId
      }
    })

    describe('and attempting to play a move', () => {
      test('Game can be played by white and black supplying valid moves when it is their turn to move', () => {
        const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer
  
        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
        onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)
        onlineGame.playMove(whitePlayerId, {from: [0, 1], to: [2, 2]}, 2)
        onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 3)
        onlineGame.playMove(whitePlayerId, {from: [0, 3], to: [4, 7]}, 4)
  
        expect(onlineGame.getCurrentGameState(whitePlayerId).gameStatus).toBe(4)
        
      })
  
      test('Attempting to supply a move for the opponent leads to no change of the board and appropriate status code', () => {
        const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer
  
        onlineGame.playMove(blackPlayerId, {from: [1, 4], to: [3, 4]}, 0)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(1)
  
        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
        expect(onlineGame.gameStateHasChanged()).toBe(true)
  
        onlineGame.playMove(whitePlayerId, {from: [6, 6], to: [4, 6]}, 1)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(0)
        
        onlineGame.playMove(whitePlayerId, {from: [6, 5], to: [4, 5]}, 1)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(0)
  
      })
  
      test('Attempting to supply an invalid move leads to no change of the board and appropiate status code', () => {
        const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer
  
        onlineGame.playMove(whitePlayerId, {from: [0, 4], to: [1, 4]}, 0)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(2)
  
        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)

        onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [3, 6]}, 1)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(2)
  
      })

      test('Attempting to move with invalid move count leads to no change of the board and appropriate status code', () => {
        const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 1)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(4)

        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)

        onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 0)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(4)

      })
    })

    describe('and draw related actions are taken', () => {
      test('If both players agree to a draw (does not have to be during the same move), the game ends', () => {
        const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
        onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)

        onlineGame.playerOffersDraw(whitePlayerId)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(3)

        onlineGame.playMove(whitePlayerId, {from: [0, 1], to: [2, 2]}, 2)
        onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 3)

        onlineGame.playerOffersDraw(blackPlayerId)
        expect(onlineGame.gameStateHasChanged()).toBe(true)
        expect(onlineGame.getCurrentGameState(whitePlayerId).gameStatus).toBe(12)
        expect(onlineGame.getCurrentGameState(blackPlayerId).gameStatus).toBe(12)
      })

      test('Players can decline or withdraw offers', () => {
        const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
        onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)

        onlineGame.playerOffersDraw(whitePlayerId)
        onlineGame.playMove(whitePlayerId, {from: [0, 1], to: [2, 2]}, 2)
        onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 3)

        onlineGame.playerResetsDrawAgreement()
        onlineGame.playerOffersDraw(blackPlayerId)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(3)

        onlineGame.playerResetsDrawAgreement()
        onlineGame.playerOffersDraw(whitePlayerId)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(3)

        onlineGame.playMove(whitePlayerId, {from: [0, 3], to: [4, 7]}, 4)
        expect(onlineGame.gameStateHasChanged()).toBe(true)
        expect(onlineGame.isActiveGame()).toBe(false)
        expect(onlineGame.getCurrentGameState(whitePlayerId).gameStatus).toBe(4)
      })

      test('Players can choose whether they would like draw offers (and code using OnlineGame can behave accordingly)', () => {
        const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

        onlineGame.playerDoesNotWantDrawOffers(whitePlayerId)
        expect(onlineGame.isDrawOffersDisabled()).toBe(true)

        onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
        onlineGame.playerOffersDraw(blackPlayerId)
        onlineGame.playerOffersDraw(blackPlayerId)
        onlineGame.playerDoesNotWantDrawOffers(blackPlayerId)
        expect(onlineGame.isDrawOffersDisabled()).toBe(true)

        onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)
        onlineGame.playerWantsDrawOffers(whitePlayerId)
        expect(onlineGame.isDrawOffersDisabled()).toBe(true)

        onlineGame.playerOffersDraw(whitePlayerId)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(3)

        onlineGame.playerWantsDrawOffers(blackPlayerId)
        expect(onlineGame.isDrawOffersDisabled()).toBe(false)

        onlineGame.playerOffersDraw(blackPlayerId)
        expect(onlineGame.gameStateHasChanged()).toBe(false)
        expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(3)

        onlineGame.playerOffersDraw(whitePlayerId)
        expect(onlineGame.gameStateHasChanged()).toBe(true)
        expect(onlineGame.getCurrentGameState(whitePlayerId).gameStatus).toBe(12)
        expect(onlineGame.getCurrentGameState(blackPlayerId).gameStatus).toBe(12)
      })

    })

    test('Players can choose to resign at any time', () => {
      const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

      onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
      onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)
      onlineGame.playMove(whitePlayerId, {from: [0, 1], to: [2, 2]}, 2)
      onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 3)

      onlineGame.playerResigns(blackPlayerId)
      expect(onlineGame.gameStateHasChanged()).toBe(true)
      expect(onlineGame.getCurrentGameState(whitePlayerId).gameStatus).toBe(6)
      expect(onlineGame.getCurrentGameState(blackPlayerId).gameStatus).toBe(6)
    })

    test('After a player abandons the game, the game can be ended appropriately', () => {
      const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

      onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
      onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)
      onlineGame.playMove(whitePlayerId, {from: [0, 1], to: [2, 2]}, 2)
      onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 3)

      onlineGame.playerAbandons(blackPlayerId)
      expect(onlineGame.gameStateHasChanged()).toBe(true)
      expect(onlineGame.getCurrentGameState(whitePlayerId).gameStatus).toBe(10)
      expect(onlineGame.getCurrentGameState(blackPlayerId).gameStatus).toBe(10)
    })

    test('When a player runs out of time, the game can be ended appropriately', () => {
      const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

      // white is very indecisive today
      onlineGame.playerTimeout(whitePlayerId)
      expect(onlineGame.gameStateHasChanged()).toBe(true)
      expect(onlineGame.getCurrentGameState(whitePlayerId).gameStatus).toBe(9)
      expect(onlineGame.getCurrentGameState(blackPlayerId).gameStatus).toBe(9)
    })
    
  })

  describe('When the game has finished', () => {
    beforeEach(() => {
      const user1 = uuidv7()
      const user2 = uuidv7()
      const onlineGame = new OnlineGame(user1, user2)

      const whitePlayerId = onlineGame.getCurrentGameState(user1).playerColor === 'white' ? user1 : user2
      const blackPlayerId = user1 === whitePlayerId ? user2 : user1

      onlineGame.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
      onlineGame.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)
      onlineGame.playMove(whitePlayerId, {from: [0, 1], to: [2, 2]}, 2)
      onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 3)
      onlineGame.playMove(whitePlayerId, {from: [0, 3], to: [4, 7]}, 4)
      
      onlineGameSetupContainer = {
        onlineGame,
        whitePlayerId,
        blackPlayerId
      }
    })

    test('it is not possible to change the game or draw state...', () => {
      const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer
      
      onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 5)
      expect(onlineGame.gameStateHasChanged()).toBe(false)
      expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(5)

      onlineGame.playerOffersDraw(whitePlayerId)
      onlineGame.playerOffersDraw(blackPlayerId)
      expect(onlineGame.gameStateHasChanged()).toBe(false)
      expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(5)

      onlineGame.playerResetsDrawAgreement()
      expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(5)

      onlineGame.playerDoesNotWantDrawOffers(whitePlayerId)
      expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(5)

      onlineGame.playerWantsDrawOffers(whitePlayerId)
      expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(5)

      onlineGame.playerResigns(whitePlayerId)
      expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(5)
    })

    test('...but it is possible to inspect state associated with the game', () => {
      const { onlineGame, whitePlayerId, blackPlayerId } = onlineGameSetupContainer

      expect(onlineGame.getCurrentGameState(whitePlayerId)).toHaveProperty('playerColor', 'white')
      expect(onlineGame.getCurrentGameState(whitePlayerId)).toHaveProperty('whitePieceInfo')

      expect(onlineGame.gameStateHasChanged()).toBe(true)

      onlineGame.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 5)
      expect(onlineGame.gameStateHasChanged()).toBe(false)
      expect(onlineGame.getGameStateHasNotChangedReasonCode()).toBe(5)

      expect(onlineGame.isActiveGame()).toBe(false)

      expect(onlineGame.isDrawOffersDisabled()).toBe(true)

      expect((typeof onlineGame.getGameId()) === 'string').toBe(true)

      expect(onlineGame.isUserPartOfGame(whitePlayerId)).toBe(true)
      expect(onlineGame.isUserPartOfGame(blackPlayerId)).toBe(true)
      expect(onlineGame.isUserPartOfGame('person who is definitely not part of the game')).toBe(false)
    })
  })
})