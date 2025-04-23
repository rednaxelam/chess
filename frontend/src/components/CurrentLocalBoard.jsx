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

const StyledBoard = styled.div`
  width: 500px;
  height: 500px;

  display: grid;
  grid-template-columns: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
  grid-template-rows: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
`


const CurrentLocalBoard = () => {
  const currentGameState = useSelector(({ localGame }) => localGame.currentGameState)
  const [draggedPieceCoords, setDraggedPieceCoords] = useState(null)

  const chessBoardState = getChessBoardState(currentGameState)

  const squaresToDisplay = []

  const lightBgColor = 'rgb(186,191,100)'
  const darkBgColor = 'rgb(235, 238, 206)'
  let currentBgColor = lightBgColor
  const alternateBgColor = () => currentBgColor = currentBgColor === lightBgColor ? darkBgColor : lightBgColor
  const { playerToMoveColor } = currentGameState
  console.log('rendering')
  for (let i = 7; i >= 0; i--) {
    alternateBgColor()
    for (let j = 0; j <= 7; j++) {
      alternateBgColor()
      let square
      if (chessBoardState[i][j]) {
        const { color, type } = chessBoardState[i][j]
        if (draggedPieceCoords) {
          if (draggedPieceCoords[0] === i && draggedPieceCoords[1] === j) {

            square = <Square
              key={i * 8 + j}
              pieceColor={color}
              pieceType={type}
              bgColor={currentBgColor}
              pieceIsBeingDragged={true}
            />
          } else {
            square = <Square
              key={i * 8 + j}
              pieceColor={color}
              pieceType={type}
              bgColor={currentBgColor}
            />
          }
        } else {
          if (color === playerToMoveColor) {
            square = <Square
              key={i * 8 + j}
              pieceColor={color}
              pieceType={type}
              bgColor={currentBgColor}
              handleMouseDown={() => setDraggedPieceCoords([i, j])}
            />
          } else {
            square = <Square
              key={i * 8 + j}
              pieceColor={color}
              pieceType={type}
              bgColor={currentBgColor}
            />
          }

        }
      } else {
        square = <Square key={i * 8 + j} bgColor={currentBgColor}/>
      }
      squaresToDisplay.push(square)
    }
  }

  return <StyledBoard>
    {squaresToDisplay}
  </StyledBoard>

}

export default CurrentLocalBoard