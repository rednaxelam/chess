import { useSelector } from 'react-redux'

const calculateMaterialDiff = (pieceInfo, pieceInfoType) => {
  if (pieceInfoType === 'live') {
    const pieceValues = {
      'pawn': 1,
      'knight': 3,
      'bishop': 3,
      'rook': 5,
      'queen': 9,
      'king': 0
    }

    const { whitePieceInfo, blackPieceInfo } = pieceInfo

    const calculateMaterialValue = (pieceInfo) => {
      return Object.keys(pieceInfo).reduce((previousValue, key) => previousValue + (pieceValues[pieceInfo[key].type]), 0)
    }

    const whiteMaterialValue = calculateMaterialValue(whitePieceInfo)
    const blackMaterialValue = calculateMaterialValue(blackPieceInfo)

    return whiteMaterialValue - blackMaterialValue
  } else {
    const pieceValues = {
      'p': 1,
      'n': 3,
      'b': 3,
      'r': 5,
      'q': 9,
      'P': -1,
      'N': -3,
      'B': -3,
      'R': -5,
      'Q': -9,
    }

    let materialValue

    if (pieceInfo === 'initial') return 0
    else {
      pieceInfo.forEach(char => pieceValues[char] ? materialValue += pieceValues[char] : undefined)
      return materialValue
    }
  }
}

const calculatePieceDiff = (pieceInfo, pieceInfoType) => {
  const pieceDiff = {
    pawn: 0,
    knight: 0,
    bishop: 0,
    rook: 0,
    queen: 0,
    king: 0
  }

  if (pieceInfoType === 'live') {
    const { whitePieceInfo, blackPieceInfo } = pieceInfo
    for (const id in whitePieceInfo) {
      pieceDiff[whitePieceInfo[id].type]++
    }
    for (const id in blackPieceInfo) {
      pieceDiff[blackPieceInfo[id].type]--
    }
    return pieceDiff
  } else {
    if (pieceInfo === 'initial') return pieceDiff
    pieceInfo.forEach(char => {
      switch (char) {
      case 'p':
        pieceDiff.pawn++
        break
      case 'P':
        pieceDiff.pawn--
        break
      case 'n':
        pieceDiff.knight++
        break
      case 'N':
        pieceDiff.knight--
        break
      case 'b':
        pieceDiff.bishop++
        break
      case 'B':
        pieceDiff.bishop--
        break
      case 'r':
        pieceDiff.rook++
        break
      case 'R':
        pieceDiff.rook--
        break
      case 'q':
        pieceDiff.queen++
        break
      case 'Q':
        pieceDiff.queen--
        break
      }
    })
    return pieceDiff
  }
}

const PlayerInfoDisplay = ({ color, pieceInfo, pieceInfoType, username }) => {
  const materialDiff = calculateMaterialDiff(pieceInfo, pieceInfoType)
  const pieceDiff = calculatePieceDiff(pieceInfo, pieceInfoType)
  const upPieces = color === 'white' ? num => num > 0 : num => num < 0
  Object.keys(pieceDiff).forEach(type => upPieces(pieceDiff[type]) ? pieceDiff[type] = Math.abs(pieceDiff[type]) : pieceDiff[type] = 0)
  const displayMaterialDiff = (materialDiff > 0 && color === 'white') || (materialDiff < 0 && color === 'black')
  return <div>
    <p>{username} - pawns: {pieceDiff.pawn} knights: {pieceDiff.knight} bishops: {pieceDiff.bishop} rooks: {pieceDiff.rook} queens: {pieceDiff.queen} {displayMaterialDiff && `+${Math.abs(materialDiff)}`}</p>
  </div>
}

const LocalPlayerInfo = ({ color }) => {
  const gameState = useSelector(({ localGame }) => localGame.currentGameState)
  const moveHistory = useSelector(({ localGame }) => localGame.currentGameState.gameHistory.moveHistory)
  const localPly = useSelector(({ moveHistory }) => moveHistory.localPly)

  const pieceInfoType = localPly || localPly === 0 ? 'historical' : 'live'
  let pieceInfo
  if (pieceInfoType === 'live') {
    pieceInfo = { whitePieceInfo: gameState.whitePieceInfo, blackPieceInfo: gameState.blackPieceInfo }
  } else {
    if (localPly !== -1) {
      const plyString = moveHistory[localPly]
      pieceInfo = plyString.split(' ')[4].split('')
    } else {
      pieceInfo = 'initial'
    }
  }
  return <PlayerInfoDisplay color={color} pieceInfo={pieceInfo} pieceInfoType={pieceInfoType} username={color} />
}

const OnlinePlayerInfo = ({ color }) => {
  const gameState = useSelector(({ onlineGame }) => onlineGame?.gameState)
  const username = useSelector(({ onlineGame }) => onlineGame?.userState[color].username)
  const moveHistory = useSelector(({ onlineGame }) => onlineGame?.gameState.gameHistory.moveHistory)
  const onlinePly = useSelector(({ moveHistory }) => moveHistory.onlinePly)

  if (!gameState || !username) return <p>loading...</p>

  const pieceInfoType = onlinePly || onlinePly === 0 ? 'historical' : 'live'
  let pieceInfo
  if (pieceInfoType === 'live') {
    pieceInfo = { whitePieceInfo: gameState.whitePieceInfo, blackPieceInfo: gameState.blackPieceInfo }
  } else {
    if (onlinePly !== -1) {
      const plyString = moveHistory[onlinePly]
      pieceInfo = plyString.split(' ')[4].split('')
    } else {
      pieceInfo = 'initial'
    }
  }
  return <PlayerInfoDisplay color={color} pieceInfo={pieceInfo} pieceInfoType={pieceInfoType} username={username}/>
}

const PlayerInfo = ({ color, mode }) => {
  if (mode === 'online') return <OnlinePlayerInfo color={color} />
  else return <LocalPlayerInfo color={color} />
}

export default PlayerInfo