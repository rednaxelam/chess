import { useSelector } from 'react-redux'
import { useEffect, useState, useContext } from 'react'
import Square from './Square'
import { ActiveBoardContext } from './ActiveBoardContext'
import styled from 'styled-components'

const getChessBoardState = currentGameState => {
  const chessBoardState = new Array(8).fill(undefined).map(() => new Array(8).fill(null))

  const { gameStatus,
    playerToMoveColor,
    playerToMoveIsInCheck,
    whitePieceInfo,
    blackPieceInfo } = currentGameState

  for (const pieceId in whitePieceInfo) {
    const pieceInfo = whitePieceInfo[pieceId]
    const pieceCoords = pieceInfo.coords
    chessBoardState[pieceCoords[0]][pieceCoords[1]] = pieceInfo
  }

  for (const pieceId in blackPieceInfo) {
    const pieceInfo = blackPieceInfo[pieceId]
    const pieceCoords = pieceInfo.coords
    chessBoardState[pieceCoords[0]][pieceCoords[1]] = pieceInfo
  }

  return chessBoardState
}

const getPreviousMoveCoords = currentGameState => {
  const { moveHistory } = currentGameState
  if (moveHistory.length === 0) return [[-1, -1], [-1, -1]]
  else return moveHistory[moveHistory.length - 1]
}

const isCoordsEqual = (coords1, coords2) => {
  return coords1[0] === coords2[0] && coords1[1] === coords2[1]
}

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

const ChessBoard = ({ orientation, currentGameState }) => {
  const { gameStatus, playerToMoveColor, playerToMoveIsInCheck } = currentGameState
  const [draggedPieceInfo, setDraggedPieceInfo] = useState(null)
  const [promotionMenuCoords, setPromotionMenuCoords] = useState(null)
  const [awaitedUpdateChanges, setAwaitedUpdateChanges] = useState(null)
  const { mode } = useContext(ActiveBoardContext)

  // clean up window listeners on unmount
  useEffect(() => {
    return () => {
      window.onmouseup = null
      window.onmousedown = null
      window.onmousemove = null
    }
  }, [])

  useEffect(() => {
    if (mode === 'online' && awaitedUpdateChanges) {
      if (currentGameState.version >= awaitedUpdateChanges.version) {
        setAwaitedUpdateChanges(null)
      }
    }
  }, [currentGameState, awaitedUpdateChanges, mode])

  const chessBoardState = getChessBoardState(currentGameState)

  if (draggedPieceInfo && promotionMenuCoords) {
    window.onmousedown = (event) => {setDraggedPieceInfo(null); setPromotionMenuCoords(null)}
  } else if (draggedPieceInfo) {
    window.onmouseup = (event) => setDraggedPieceInfo(null)
  } else {
    window.onmouseup = null
    window.onmousedown = null
    window.onmousemove = null
  }

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

  let previousMoveFromCoords, previousMoveToCoords
  if (awaitedUpdateChanges) {
    previousMoveFromCoords = awaitedUpdateChanges.from
    previousMoveToCoords = awaitedUpdateChanges.to
  } else {
    [previousMoveFromCoords, previousMoveToCoords] = getPreviousMoveCoords(currentGameState)
  }

  let draggedPieceCanMoveToSquare
  let draggedPieceCoords
  let draggedPieceType
  if (draggedPieceInfo) {
    draggedPieceCoords = draggedPieceInfo.coords
    draggedPieceType = draggedPieceInfo.type
    draggedPieceCanMoveToSquare = (coords) => {
      const possibleMoves = chessBoardState[draggedPieceCoords[0]][draggedPieceCoords[1]].possibleMoves
      return possibleMoves.findIndex(to => coords[0] === to[0] && coords[1] === to[1]) !== -1
    }
  }

  const colorOfWinner = gameStatus < 4 ? undefined : gameStatus >= 12 ? 'na' : gameStatus % 2 === 0 ? 'white' : 'black'
  const colorOfPlayerInCheck = playerToMoveIsInCheck ? playerToMoveColor : 'na'

  for (let i = orientation === 'white' ? 7 : 0; orientation === 'white' ? i >= 0 : i <= 7; orientation === 'white' ? i-- : i++) {
    alternateBgColor()
    for (let j = orientation === 'white' ? 0 : 7; orientation === 'white' ? j <= 7 : j >= 0; orientation === 'white' ? j++ : j--) {
      alternateBgColor()
      if (isCoordsEqual([i, j], previousMoveFromCoords) || isCoordsEqual([i, j], previousMoveToCoords)) {
        alternateBgColorPreviousMove()
      }
      let square
      if (gameStatus >= 4) {
        if (chessBoardState[i][j]) {
          const { color, type } = chessBoardState[i][j]
          square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfWinner={colorOfWinner} colorOfPlayerInCheck={colorOfPlayerInCheck}/>
        } else {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} />
        }
      } else if (mode === 'online' && playerToMoveColor !== currentGameState.playerColor) {
        if (chessBoardState[i][j]) {
          const { color, type } = chessBoardState[i][j]
          square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfPlayerInCheck={colorOfPlayerInCheck}/>
        } else {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} />
        }
      } else if (awaitedUpdateChanges) {
        if (awaitedUpdateChanges.from[0] === i && awaitedUpdateChanges.from[1] === j) {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} />
        } else if (awaitedUpdateChanges.to[0] === i && awaitedUpdateChanges.to[1] === j) {
          const color = awaitedUpdateChanges.pieceColor
          const type = awaitedUpdateChanges.pieceType
          square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfPlayerInCheck={colorOfPlayerInCheck} isAwaited={true}/>
        } else if (chessBoardState[i][j]) {
          const { color, type } = chessBoardState[i][j]
          square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfPlayerInCheck={colorOfPlayerInCheck}/>
        } else {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} />
        }
      } else if (promotionMenuCoords) {
        if (promotionMenuCoords[0] === i && promotionMenuCoords[1] === j) {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} displayPromotionMenu={true} orientation={orientation} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} setAwaitedUpdateChanges={setAwaitedUpdateChanges}/>
        } else if (chessBoardState[i][j] && !(draggedPieceCoords[0] === i && draggedPieceCoords[1] === j)) {
          const { color, type } = chessBoardState[i][j]
          square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfPlayerInCheck={colorOfPlayerInCheck}/>
        } else {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} />
        }
      } else if (draggedPieceCoords) {
        if (chessBoardState[i][j]) {
          const { color, type } = chessBoardState[i][j]
          if (draggedPieceCoords[0] === i && draggedPieceCoords[1] === j) {
            square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} pieceIsBeingDragged={true} colorOfPlayerInCheck={colorOfPlayerInCheck} highlightOnHover={true} />
          } else {
            if (draggedPieceCanMoveToSquare([i, j])) {
              square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} highlightOnHover={true} setAwaitedUpdateChanges={setAwaitedUpdateChanges}/>
            } else {
              square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfPlayerInCheck={colorOfPlayerInCheck} highlightOnHover={true} />
            }
          }
        } else {
          if (draggedPieceCanMoveToSquare([i, j])) {
            square = <Square key={i * 8 + j} bgColor={currentBgColor} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} highlightOnHover={true} setAwaitedUpdateChanges={setAwaitedUpdateChanges}/>
          } else {
            square = <Square key={i * 8 + j} bgColor={currentBgColor} highlightOnHover={true} />
          }
        }
      } else {
        if (chessBoardState[i][j]) {
          const { color, type } = chessBoardState[i][j]
          if (color === playerToMoveColor) {
            square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} handleMouseDown={() => setDraggedPieceInfo({ coords: [i, j], type: type })} colorOfPlayerInCheck={colorOfPlayerInCheck} />
          } else {
            square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} />
          }
        } else {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} />
        }
      }
      squaresToDisplay.push(square)
    }
  }

  return <StyledBoard>
    {squaresToDisplay}
  </StyledBoard>

}

const LocalChessBoard = ({ orientation }) => {
  if (orientation === 'auto') orientation = 'white'

  const currentGameState = useSelector(({ localGame }) => localGame.currentGameState)
  return <ChessBoard orientation={orientation} currentGameState={currentGameState} />
}

const OnlineChessBoard = ({ orientation }) => {
  const currentGameState = useSelector(({ onlineGame }) => onlineGame?.gameState)
  if (orientation === 'auto') orientation = currentGameState?.playerColor

  if (!currentGameState) {
    return <p>getting game state...</p>
  }
  else {
    return <ChessBoard orientation={orientation} currentGameState={currentGameState} />
  }
}

const ActiveBoard = ({ orientation, mode }) => {
  if (mode === 'online') {
    return <ActiveBoardContext value={{ mode }}>
      <OnlineChessBoard orientation={orientation} />
    </ActiveBoardContext>
  } else if (mode === 'local') {
    return <ActiveBoardContext value={{ mode }}>
      <LocalChessBoard orientation={orientation} />
    </ActiveBoardContext>
  } else {
    return null
  }
}

export default ActiveBoard