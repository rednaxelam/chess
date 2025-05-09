import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
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

  const lightBgColor = 'rgb(186,191,100)'
  const darkBgColor = 'rgb(235, 238, 206)'
  let currentBgColor = lightBgColor
  const alternateBgColor = () => currentBgColor = currentBgColor === lightBgColor ? darkBgColor : lightBgColor
  const { playerToMoveColor } = currentGameState

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

  console.log('rendering')
  for (let i = 7; i >= 0; i--) {
    alternateBgColor()
    for (let j = 0; j <= 7; j++) {
      alternateBgColor()
      let square
      if (promotionMenuCoords) {
        if (promotionMenuCoords[0] === i && promotionMenuCoords[1] === j) {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} displayPromotionMenu={true} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} />
        } else if (chessBoardState[i][j] && !(draggedPieceCoords[0] === i && draggedPieceCoords[1] === j)) {
          const { color, type } = chessBoardState[i][j]
          square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} />
        } else {
          square = <Square key={i * 8 + j} bgColor={currentBgColor} />
        }
      } else if (draggedPieceCoords) {
        if (chessBoardState[i][j]) {
          const { color, type } = chessBoardState[i][j]
          if (draggedPieceCoords[0] === i && draggedPieceCoords[1] === j) {
            square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} pieceIsBeingDragged={true} />
          } else {
            if (draggedPieceCanMoveToSquare([i, j])) {
              square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} />
            } else {
              square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} />
            }
          }
        } else {
          if (draggedPieceCanMoveToSquare([i, j])) {
            square = <Square key={i * 8 + j} bgColor={currentBgColor} moveInfo={{ from: draggedPieceCoords, to: [i, j], pieceType: draggedPieceType, pieceColor: playerToMoveColor }} setDraggedPieceInfo={setDraggedPieceInfo} setPromotionMenuCoords={setPromotionMenuCoords} />
          } else {
            square = <Square key={i * 8 + j} bgColor={currentBgColor} />
          }
        }
      }
      else {
        if (chessBoardState[i][j]) {
          const { color, type } = chessBoardState[i][j]
          if (color === playerToMoveColor) {
            square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={currentBgColor} handleMouseDown={() => setDraggedPieceInfo({ coords: [i, j], type: type })} />
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