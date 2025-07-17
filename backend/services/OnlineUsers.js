const { generateRandomName } = require('./name-generator')
const { OnlineGame } = require('./OnlineGame')

class OnlineUsers {

  #onlineUsers
  #matchmakingQueue

  constructor() {
    this.#onlineUsers = {}
    this.#matchmakingQueue = []
  }

  addUserConnection(userId, socketId) {
    if (userId in this.#onlineUsers) {
      this.#onlineUsers[userId].sockets.add(socketId)
    } else {
      this.#onlineUsers[userId] = {
        onlineGameStatus: 0,
        onlineGame: null,
        sockets: new Set([socketId]),
        username: generateRandomName(),
      }
    }
    return this.#success(null)
  }

  removeUserConnection(userId, socketId) {
    if (!this.#isUserIdInOnlineUsers(userId)) return this.#userIdNotFound(userId)

    const onlineUser = this.#getOnlineUser(userId)
    onlineUser.sockets.delete(socketId)
    if (onlineUser.sockets.size === 0) {
      if (onlineUser.onlineGameStatus === 1) {
        this.leaveMatchmakingQueue(userId)
      }
    }
    return this.#success(null)
  }

  generateNewRandomName(userId) {
    if (!this.#isUserIdInOnlineUsers(userId)) return this.#userIdNotFound(userId)
    
    const newName = generateRandomName()
    this.#getOnlineUser(userId).username = newName
    return this.#success(newName)
  }

  joinMatchmakingQueue(userId) {
    if (!this.#isUserIdInOnlineUsers(userId)) return this.#userIdNotFound(userId)

    const joinActiveGame = (userId, onlineGame, userIdsThatJoinedGames) => {
      const user = this.#getOnlineUser(userId)
      user.onlineGameStatus = 2
      user.onlineGame = onlineGame
      userIdsThatJoinedGames.push(userId)
    }

    const user = this.#getOnlineUser(userId)
    if (user.sockets.size === 0) {
      return this.#failure(5, 'no have an active socket io connection')
    } else if (user.onlineGameStatus === 2) {
      return this.#failure(2, 'already in game')
    } else if (user.onlineGameStatus === 1) {
      return this.#failure(1, 'already in matchmaking queue')
    } else {
      this.#matchmakingQueue.push(userId)
      user.onlineGameStatus = 1
    }

    const userIdsThatJoinedGames = []
    if (this.#matchmakingQueue.length > 2) {
      throw new Error('Matchmaking queue exceeded length of 2')
    } else if (this.#matchmakingQueue.length === 2) {
      const userId1 = this.#matchmakingQueue.shift()
      const userId2 = this.#matchmakingQueue.shift()
      const onlineGame = new OnlineGame(userId1, userId2)
      joinActiveGame(userId1, onlineGame, userIdsThatJoinedGames)
      joinActiveGame(userId2, onlineGame, userIdsThatJoinedGames)
    }

    return this.#success(userIdsThatJoinedGames)
  }

  leaveMatchmakingQueue(userId) {
    if (!this.#isUserIdInOnlineUsers(userId)) return this.#userIdNotFound(userId)

    const user = this.#getOnlineUser(userId)
    if (user.onlineGameStatus === 2) {
      return this.#failure(2, 'already in game')
    } else if (user.onlineGameStatus === 0) {
      return this.#failure(3, 'not in game or matchmaking queue')
    } else {
      if (this.#matchmakingQueue.length !== 1) {
        throw new Error('user in matchmaking queue tried to leave matchmaking queue that was not of length 1')
      } else if (this.#matchmakingQueue[0] !== userId) {
        throw new Error('user marked as being in the matchmaking queue was not in the matchmaking queue')
      } else {
        user.onlineGameStatus = 0
        this.#matchmakingQueue = []
        return this.#success(null)
      }
    }
  }

  // it is assumed that only valid onlineGames (those attached to users and interacted with appropriately) will 
  // be used for the onlineGame argument
  chessGameHasConcluded(onlineGame) {
    if (onlineGame.isActiveGame()) {
      return this.#failure(7, 'Chess game is still in progress')
    } else {
      const usersInGame = onlineGame.getUsers()
      // the following assumes that users will not be removed from OnlineUsers while the game is active
      this.#getOnlineUser(usersInGame.white).onlineGameStatus = 0
      this.#getOnlineUser(usersInGame.black).onlineGameStatus = 0
      return this.#success(null)
    }
  }

  getOnlineGameStatus(userId) {
    // onlineGameStatus code guide:
    // 0 - user is not in matchmaking queue or live online game
    // 1 - user is in matchmaking queue
    // 2 - user is in live online game
    if (!this.#isUserIdInOnlineUsers(userId)) return this.#userIdNotFound(userId)

    return this.#success(this.#getOnlineUser(userId).onlineGameStatus)
  }

  getOnlineUserState(userId) {
    if (!this.#isUserIdInOnlineUsers(userId)) return this.#userIdNotFound(userId)

    const user = this.#getOnlineUser(userId)

    const userRepresentation = {
      onlineGameStatus: user.onlineGameStatus,
      hasOnlineGame: user.onlineGame ? true : false,
      username: user.username,
    }

    return this.#success(userRepresentation)
  }

  getOnlineGame(userId) {
    if (!this.#isUserIdInOnlineUsers(userId)) return this.#userIdNotFound(userId)

    const user = this.#getOnlineUser(userId)
    if (!user.onlineGame) {
      return this.#failure(4, 'no online game found')
    } else {
      return this.#success(user.onlineGame)
    }
    
  }
  
  #isUserIdInOnlineUsers(userId) {
    return userId in this.#onlineUsers
  }

  // Online user operation status code guide:

  // 0 - operation was successful

  // code - reason why operation was unsuccessful
  // 1 - user is in matchmaking queue 
  // 2 - user is in an active game
  // 3 - user is not in game or matchmaking
  // 4 - user has no online game associated with them
  // 5 - user does not currently have a socket io connection with the server
  // 6 - user id not found
  // 7 - game still in progress

  #userIdNotFound(userId) {
    return {
      statusCode: 6,
      data: null,
      errMsg: `no user with id ${userId}`,
    }
  }

  #success(data) {
    return {
      statusCode: 0,
      data,
      errMsg: null,
    }
  }

  #failure(statusCode, errMsg) {
    return {
      statusCode,
      data: null,
      errMsg,
    }
  }

  // this method should only be used after confirming the existence of the userId via isUserIdInOnlineUsers
  #getOnlineUser(userId) {
    return this.#onlineUsers[userId]
  }

  // #isRemovable(userId) {
  //   // code
  //   return this.#getOnlineUser(userId).onlineGameStatus === 0 && this.#getOnlineUser(userId).sockets.size === 0 && this.#getOnlineUser(userId).onlineGame === null
  // }


}

module.exports = {
  OnlineUsers
}
