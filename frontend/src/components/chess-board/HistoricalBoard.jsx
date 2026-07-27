import { useSelector } from 'react-redux'
import Square from './Square'
import styled from 'styled-components'

const bgColors = {
  lightBgColor: 'rgb(186,191,100)',
  lightBgColorPreviousMove: 'rgb(155, 156, 128)',
  darkBgColor: 'rgb(235, 238, 206)',
  darkBgColorPreviousMove: 'rgb(215, 203, 203)',
}

const StyledBoard = styled.div`
  width: 500px;
  height: 500px;
  user-select: none;

  display: grid;
  grid-template-columns: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
  grid-template-rows: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
`

const isCoordsEqual = (coords1, coords2) => {
  return coords1[0] === coords2[0] && coords1[1] === coords2[1]
}

const pieceCharPieceInfoDictionary = {
  'p': { type: 'pawn', color: 'white' },
  'n': { type: 'knight', color: 'white' },
  'b': { type: 'bishop', color: 'white' },
  'r': { type: 'rook', color: 'white' },
  'q': { type: 'queen', color: 'white' },
  'k': { type: 'king', color: 'white' },
  'P': { type: 'pawn', color: 'black' },
  'N': { type: 'knight', color: 'black' },
  'B': { type: 'bishop', color: 'black' },
  'R': { type: 'rook', color: 'black' },
  'Q': { type: 'queen', color: 'black' },
  'K': { type: 'king', color: 'black' },
}

const convertPiecePlacementStringToBoardState = (piecePlacementString) => {
  const chessBoardState = new Array(8).fill(undefined).map(() => new Array(8).fill(null))
  const piecePlacementInfo = piecePlacementString.split('/').map((rowPlacement) => rowPlacement.split(''))
  for (let i = 0; i < 8; i++) {
    for (let j = 0, k = 0; k < piecePlacementInfo[i].length; k++) {
      const char = piecePlacementInfo[i][k]
      const isEmptySpacesCount = Number.isInteger(parseInt(char))
      if (isEmptySpacesCount) {
        j += parseInt(char)
      } else {
        chessBoardState[i][j] = pieceCharPieceInfoDictionary[char]
        j++
      }
    }
  }
  return chessBoardState
}

const convertPlyStringToBoardAndGameState = (plyString) => {
  if (plyString === 'initial') plyString = '99,99 na w f rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

  const plyInfo = plyString.split(' ')
  const previousMoveCoords = plyInfo[0].split(',').map(coordPairStr => coordPairStr.split('').map(coordStr => Number(coordStr)))
  const playerToMoveColor = plyInfo[2] === 'w' ? 'white' : 'black'
  const playerToMoveIsInCheck = plyInfo[3] === 't' ? true : false
  const chessBoardState = convertPiecePlacementStringToBoardState(plyInfo[4])

  return { previousMoveCoords, playerToMoveColor, playerToMoveIsInCheck, chessBoardState }
}

const ChessBoard = ({ orientation, plyString, gameOutcome, isFinalPly }) => {
  const { previousMoveCoords,
    playerToMoveColor,
    playerToMoveIsInCheck,
    chessBoardState } = convertPlyStringToBoardAndGameState(plyString)

  const squaresToDisplay = []

  const { lightBgColor, lightBgColorPreviousMove, darkBgColor, darkBgColorPreviousMove } = bgColors
  let currentBgColor = darkBgColor
  const alternateBgColor = () => {
    if (currentBgColor === lightBgColor || currentBgColor === lightBgColorPreviousMove) currentBgColor = darkBgColor
    else currentBgColor = lightBgColor
  }
  const alternateBgColorPreviousMove = () => {
    if (currentBgColor === lightBgColor) currentBgColor = lightBgColorPreviousMove
    else currentBgColor = darkBgColorPreviousMove
  }

  const [previousMoveFromCoords, previousMoveToCoords] = previousMoveCoords

  const outcomeStyling = !(gameOutcome && isFinalPly ) ? undefined : gameOutcome >= 12 ? 'na' : gameOutcome % 2 === 0 ? 'white' : 'black'
  const checkStyling = playerToMoveIsInCheck ? playerToMoveColor : 'na'

  for (let i = orientation === 'white' ? 7 : 0; orientation === 'white' ? i >= 0 : i <= 7; orientation === 'white' ? i-- : i++) {
    alternateBgColor()
    for (let j = orientation === 'white' ? 0 : 7; orientation === 'white' ? j <= 7 : j >= 0; orientation === 'white' ? j++ : j--) {
      alternateBgColor()
      if (isCoordsEqual([i, j], previousMoveFromCoords) || isCoordsEqual([i, j], previousMoveToCoords)) {
        alternateBgColorPreviousMove()
      }
      let square
      if (chessBoardState[i][j]) {
        const { color, type } = chessBoardState[i][j]
        square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfWinner={outcomeStyling} colorOfPlayerInCheck={checkStyling}/>
      } else {
        square = <Square key={i * 8 + j} bgColor={currentBgColor} />
      }
      squaresToDisplay.push(square)
    }
  }

  return <StyledBoard>
    {squaresToDisplay}
  </StyledBoard>
}

const LocalHistoricalBoard = ({ orientation }) => {
  const moveHistory = useSelector(({ localGame }) => localGame.currentGameState.gameHistory.moveHistory)
  const gameOutcome = useSelector(({ localGame }) => localGame.currentGameState.gameHistory.gameOutcome)
  const localPly = useSelector(({ moveHistory }) => moveHistory.localPly)

  if (orientation === 'auto') orientation = 'white'

  if (localPly === null) return null
  else {
    const plyString = localPly === -1 ? 'initial' : moveHistory[localPly]
    const isFinalPly = localPly === moveHistory.length - 1
    return <ChessBoard orientation={orientation} plyString={plyString} gameOutcome={gameOutcome} isFinalPly={isFinalPly} />
  }
}

const OnlineHistoricalBoard = ({ orientation }) => {
  const moveHistory = useSelector(({ onlineGame }) => onlineGame?.gameState.gameHistory.moveHistory)
  const gameOutcome = useSelector(({ onlineGame }) => onlineGame?.gameState.gameHistory.gameOutcome)
  const playerColor = useSelector(({ onlineGame }) => onlineGame?.gameState.playerColor)
  const onlinePly = useSelector(({ moveHistory }) => moveHistory.onlinePly)

  if (orientation === 'auto') orientation = playerColor

  if (onlinePly === null) return null
  else {
    const plyString = onlinePly === -1 ? 'initial' : moveHistory[onlinePly]
    const isFinalPly = onlinePly === moveHistory.length - 1
    return <ChessBoard orientation={orientation} plyString={plyString} gameOutcome={gameOutcome} isFinalPly={isFinalPly} />
  }
}

const HistoricalBoard = ({ orientation, mode }) => {
  if (mode === 'local') return <LocalHistoricalBoard orientation={orientation} />
  else if (mode === 'online') return <OnlineHistoricalBoard orientation={orientation} />
}

export default HistoricalBoard