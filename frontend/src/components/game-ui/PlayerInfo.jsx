import { useSelector } from 'react-redux'

const calculateMaterialDiff = (whitePieceInfo, blackPieceInfo) => {
  const pieceValues = {
    'pawn': 1,
    'knight': 3,
    'bishop': 3,
    'rook': 5,
    'queen': 9,
    'king': 0
  }

  const calculateMaterialValue = (pieceInfo) => {
    return Object.keys(pieceInfo).reduce((previousValue, key) => previousValue + (pieceValues[pieceInfo[key].type]), 0)
  }

  const whiteMaterialValue = calculateMaterialValue(whitePieceInfo)
  const blackMaterialValue = calculateMaterialValue(blackPieceInfo)

  return whiteMaterialValue - blackMaterialValue
}

const calculatePiecesTaken = (pieceInfo, color) => {
  const piecesTaken = {
    pawn: 0,
    knight: 0,
    bishop: 0,
    rook: 0,
    queen: 0,
  }

  for (let id = color === 'white' ? 0 : 16; color === 'white' ? id <= 7: id <= 23; id++) {
    if (!Object.hasOwn(pieceInfo, id) || (Object.hasOwn(pieceInfo, id) && pieceInfo[id].type !== 'pawn')) {
      piecesTaken.pawn++
    }
  }

  const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  const diff = color === 'white' ? 8 : 24

  for (let i = 0; i <= 7; i++) {
    if (!Object.hasOwn(pieceInfo, i + diff)) piecesTaken[pieceOrder[i]]++
  }

  return piecesTaken
}

const PlayerInfoDisplay = ({ color, gameState, username }) => {
  if (!gameState || !username) return <p>loading...</p>

  const { whitePieceInfo, blackPieceInfo } = gameState
  const materialDiff = calculateMaterialDiff(whitePieceInfo, blackPieceInfo)
  const piecesTaken = calculatePiecesTaken(color === 'white' ? blackPieceInfo : whitePieceInfo, color === 'white' ? 'black' : 'white')

  const displayMaterialDiff = (materialDiff > 0 && color === 'white') || (materialDiff < 0 && color === 'black')
  return <div>
    <p>{username} - pawns: {piecesTaken.pawn} knights: {piecesTaken.knight} bishops: {piecesTaken.bishop} rooks: {piecesTaken.rook} queens: {piecesTaken.queen} {displayMaterialDiff && `+${Math.abs(materialDiff)}`}</p>
  </div>
}

const LocalPlayerInfo = ({ color }) => {
  const gameState = useSelector(({ localGame }) => localGame.currentGameState)
  return <PlayerInfoDisplay color={color} gameState={gameState} username={color} />
}

const OnlinePlayerInfo = ({ color }) => {
  const gameState = useSelector(({ onlineGame }) => onlineGame?.gameState)
  const username = useSelector(({ onlineGame }) => onlineGame?.userState[color].username)
  return <PlayerInfoDisplay color={color} gameState={gameState} username={username}/>
}

const PlayerInfo = ({ color, mode }) => {
  if (mode === 'online') return <OnlinePlayerInfo color={color} />
  else return <LocalPlayerInfo color={color} />
}

export default PlayerInfo