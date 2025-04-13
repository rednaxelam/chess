import { useSelector } from 'react-redux'
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
  border-width: 1px 1px 0px 0px;
  border-color: black;
  border-style: solid;

  display: grid;
  grid-template-columns: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
  grid-template-rows: 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%;
`

const CurrentLocalBoard = () => {
  const currentGameState = useSelector(({ localGame }) => localGame.currentGameState)

  const chessBoardState = getChessBoardState(currentGameState)

  const squaresToDisplay = []

  for (let i = 7; i >= 0; i--) {
    for (let j = 0; j <= 7; j++) {
      let square
      if (chessBoardState[i][j]) {
        const { color, type } = chessBoardState[i][j]
        square = <Square key={i * 8 + j} pieceColor={color} pieceType={type} bgColor={'white'}/>
      } else {
        square = <Square key={i * 8 + j} bgColor={'white'}/>
      }
      squaresToDisplay.push(square)
    }
  }

  return <StyledBoard>
    {squaresToDisplay}
  </StyledBoard>

}

export default CurrentLocalBoard