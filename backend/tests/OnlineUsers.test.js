const { OnlineUsers } = require('../services/OnlineUsers')

const user1Id = 'user1Id'
const user2Id = 'user2Id'
const user3Id = 'user3Id'

const user1Idsocket1 = ['user1Id', 'a socket id' ]
const user1Idsocket2 = ['user1Id', 'another socket id' ]
const user1Idsocket3 = ['user1Id', 'yet another socket id' ]

const user2Idsocket1 = ['user2Id', 'unique socket id']

const user3IdSocket1 = ['user3Id', 'a very unique socket id']

let onlineUsers

describe('OnlineUsers Testing', () => {
  test('User connections can be added to OnlineUsers after the connection is made', () => {
    const onlineUsers = new OnlineUsers()
    onlineUsers.addUserConnection(...user1Idsocket1)
    onlineUsers.addUserConnection(...user1Idsocket2)
    onlineUsers.addUserConnection(...user1Idsocket3)
    onlineUsers.addUserConnection(...user2Idsocket1)

    expect(onlineUsers.addUserConnection(...user2Idsocket1).statusCode).toBe(0)
    expect(onlineUsers.getOnlineUserState(user1Id).statusCode).toBe(0)

    expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(0)
    expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(0)
    
    expect(onlineUsers.getOnlineUserState(user1Id).data.numConnections).toBe(3)
    expect(onlineUsers.getOnlineUserState(user2Id).data.numConnections).toBe(1)
    
    expect((typeof onlineUsers.getOnlineUserState(user1Id).data.username) === 'string').toBe(true)
    expect((typeof onlineUsers.getOnlineUserState(user2Id).data.username) === 'string').toBe(true)
  })

  describe('When there are users connected to the app...', () => {
    beforeEach(() => {
      onlineUsers = new OnlineUsers()
      onlineUsers.addUserConnection(...user1Idsocket1)
      onlineUsers.addUserConnection(...user1Idsocket2)
      onlineUsers.addUserConnection(...user1Idsocket3)
      onlineUsers.addUserConnection(...user2Idsocket1)
      onlineUsers.addUserConnection(...user3IdSocket1)
    })

    test('User connections can be removed after they disconnect', () => {
      expect(onlineUsers.removeUserConnection(...user1Idsocket2).statusCode).toBe(0)
      expect(onlineUsers.getOnlineUserState(user1Id).data.numConnections).toBe(2)

      expect(onlineUsers.removeUserConnection(...user2Idsocket1).statusCode).toBe(0)
      expect(onlineUsers.getOnlineUserState(user2Id).data.numConnections).toBe(0)
    })

    describe('...who are performing matchmaking operations', () => {
      test('After two users have joined the queue, they will paired together for a game', () => {
        expect(onlineUsers.joinMatchmakingQueue(user1Id).statusCode).toBe(0)
        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(1)

        expect(onlineUsers.joinMatchmakingQueue(user2Id).statusCode).toBe(0)
        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(2)
        expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(2)
      })

      test('Users can leave and rejoin the matchmaking queue', () => {
        expect(onlineUsers.joinMatchmakingQueue(user1Id).statusCode).toBe(0)
        expect(onlineUsers.leaveMatchmakingQueue(user1Id).statusCode).toBe(0)

        expect(onlineUsers.joinMatchmakingQueue(user2Id).statusCode).toBe(0)
        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(0)
        expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(1)

        expect(onlineUsers.joinMatchmakingQueue(user1Id).statusCode).toBe(0)
        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(2)
        expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(2)
      })

      test('If a user disconnects and has no other connections, they leave the matchmaking queue', () => {
        onlineUsers.joinMatchmakingQueue(user2Id)
        expect(onlineUsers.removeUserConnection(...user2Idsocket1).statusCode).toBe(0)

        onlineUsers.joinMatchmakingQueue(user1Id)
        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(1)
        expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(0)
      })

      test('A user with no connections will fail to join the queue', () => {
        onlineUsers.joinMatchmakingQueue(user1Id)

        onlineUsers.removeUserConnection(...user3IdSocket1)

        expect(onlineUsers.joinMatchmakingQueue(user3Id).statusCode).toBe(5)

        expect(onlineUsers.joinMatchmakingQueue(user2Id).data).toHaveLength(2)

        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(2)
        expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(2)
        expect(onlineUsers.getOnlineUserState(user3Id).data.onlineGameStatus).toBe(0)
      })

      test('If a user is already in a game or the matchmaking queue, they are not able to join (or join again) the queue', () => {
        onlineUsers.joinMatchmakingQueue(user1Id)

        expect(onlineUsers.joinMatchmakingQueue(user1Id).statusCode).toBe(1)

        onlineUsers.joinMatchmakingQueue(user2Id)

        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(2)
        expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(2)

        expect(onlineUsers.joinMatchmakingQueue(user1Id).statusCode).toBe(2)
      })

      test('After the completion of a game, the queue can be joined again', () => {
        onlineUsers.joinMatchmakingQueue(user1Id)
        onlineUsers.joinMatchmakingQueue(user2Id)
        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(2)
        
        onlineUsers.getOnlineGame(user1Id).data.playerResigns(user1Id)
        onlineUsers.chessGameHasConcluded((onlineUsers.getOnlineGame(user1Id)).data)
        expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(0)

        onlineUsers.joinMatchmakingQueue(user1Id)
        expect(onlineUsers.getOnlineGameStatus(user1Id).data).toBe(1)
      })

      test('If in a game or idle, attempting to leave the matchmaking queue will lead to an error', () => {
        expect(onlineUsers.leaveMatchmakingQueue(user1Id).statusCode).toBe(3)

        onlineUsers.joinMatchmakingQueue(user1Id)
        onlineUsers.joinMatchmakingQueue(user2Id)

        expect(onlineUsers.leaveMatchmakingQueue(user2Id).statusCode).toBe(2)
      })
    })

    test('Moving pieces (along with other online game actions) can be done by interacting with the game associated with a user. When games have finished (and only when they have finished), user state is updated by using chessGameHasConcluded', () => {
      onlineUsers.joinMatchmakingQueue(user1Id)
      onlineUsers.joinMatchmakingQueue(user2Id)
      expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(2)
      
      const usersInGame = onlineUsers.getOnlineGame(user1Id).data.getUsers()
      const whitePlayerId = usersInGame.white
      const blackPlayerId = usersInGame.black
      onlineUsers.getOnlineGame(whitePlayerId).data.playMove(whitePlayerId, {from: [1, 4], to: [3, 4]}, 0)
      onlineUsers.getOnlineGame(blackPlayerId).data.playMove(blackPlayerId, {from: [6, 6], to: [4, 6]}, 1)

      expect(onlineUsers.chessGameHasConcluded((onlineUsers.getOnlineGame(whitePlayerId)).data).statusCode).toBe(7)

      onlineUsers.getOnlineGame(whitePlayerId).data.playMove(whitePlayerId, {from: [0, 1], to: [2, 2]}, 2)
      onlineUsers.getOnlineGame(blackPlayerId).data.playMove(blackPlayerId, {from: [6, 5], to: [4, 5]}, 3)
      onlineUsers.getOnlineGame(whitePlayerId).data.playMove(whitePlayerId, {from: [0, 3], to: [4, 7]}, 4)
      
      expect(onlineUsers.chessGameHasConcluded((onlineUsers.getOnlineGame(whitePlayerId)).data).statusCode).toBe(0)
      expect(onlineUsers.getOnlineUserState(user1Id).data.onlineGameStatus).toBe(0)
      expect(onlineUsers.getOnlineUserState(user2Id).data.onlineGameStatus).toBe(0)

    })

    test('Supplying a userId not already in OnlineUsers leads to an error for all methods requiring one except addUserConnection', () => {
      expect(onlineUsers.removeUserConnection('not a user id in OnlineUsers', 'not a socket id').statusCode).toBe(6)
      expect(onlineUsers.generateNewRandomName('not a user id in OnlineUsers').statusCode).toBe(6)
      expect(onlineUsers.joinMatchmakingQueue('not a user id in OnlineUsers').statusCode).toBe(6)
      expect(onlineUsers.leaveMatchmakingQueue('not a user id in OnlineUsers').statusCode).toBe(6)
      expect(onlineUsers.getOnlineGameStatus('not a user id in OnlineUsers').statusCode).toBe(6)
      expect(onlineUsers.getOnlineUserState('not a user id in OnlineUsers').statusCode).toBe(6)
      expect(onlineUsers.getOnlineGame('not a user id in OnlineUsers').statusCode).toBe(6)
    })
  })
})

