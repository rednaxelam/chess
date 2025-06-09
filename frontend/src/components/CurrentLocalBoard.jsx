import { useSelector } from 'react-redux'
import { useState } from 'react'
import Square from './Square'
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


const CurrentLocalBoard = () => {
  const currentGameState = useSelector(({ localGame }) => localGame.currentGameState)
  const { gameStatus, playerToMoveColor, playerToMoveIsInCheck } = currentGameState
  const [draggedPieceInfo, setDraggedPieceInfo] = useState(null)
  const [promotionMenuCoords, setPromotionMenuCoords] = useState(null)

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
  let currentBgColor = lightBgColor
  const alternateBgColor = () => {
    if (currentBgColor === lightBgColor || currentBgColor === lightBgColorPreviousMove) currentBgColor = darkBgColor
    else currentBgColor = lightBgColor
  }
  const alternateBgColorPreviousMove = () => {
    if (currentBgColor === lightBgColor) currentBgColor = lightBgColorPreviousMove
    else currentBgColor = darkBgColorPreviousMove
  }
  const [previousMoveFromCoords, previousMoveToCoords] = getPreviousMoveCoords(currentGameState)

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

  console.log('rendering')
  for (let i = 7; i >= 0; i--) {
    alternateBgColor()
    for (let j = 0; j <= 7; j++) {
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
      } else if (promotionMenuCoords) {
        if (promotionMenuCoords[0] === i && promotionMenuCoords[1] === j) {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} displayPromotionMenu={true} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} />
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
            square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} pieceIsBeingDragged={true} colorOfPlayerInCheck={colorOfPlayerInCheck}/>
          } else {
            if (draggedPieceCanMoveToSquare([i, j])) {
              square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} />
            } else {
              square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} colorOfPlayerInCheck={colorOfPlayerInCheck} />
            }
          }
        } else {
          if (draggedPieceCanMoveToSquare([i, j])) {
            square = <Square key={i * 8 + j} bgColor={currentBgColor} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} />
          } else {
            square = <Square key={i * 8 + j} bgColor={currentBgColor} />
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

export default CurrentLocalBoard