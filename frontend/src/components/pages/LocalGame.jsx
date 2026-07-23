import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ActiveBoard from '../chess-board/ActiveBoard'
import PlayerInfo from '../game-ui/PlayerInfo'
import MoveHistory from '../game-ui/MoveHistory'
import { endAsDrawViaAgreement, whiteResigns, blackResigns, reset } from '../../reducers/localGameReducer'
import gameStatusCodeDescriptions from '../../utils/gameStatusCodeDescriptions'

const Result = ({ currentGameStatus }) => {
  if (currentGameStatus < 4) return null
  else {
    return <p>Result: {gameStatusCodeDescriptions[currentGameStatus]}</p>
  }
}

const LocalGame = () => {
  const currentGameStatus = useSelector(({ localGame }) => localGame.currentGameState.gameStatus)
  const [orientation, setOrientation] = useState('white')
  const dispatch = useDispatch()

  return <main>
    <button onClick={() => orientation === 'white' ? setOrientation('black') : setOrientation('white')}>🔁</button>
    <button onClick={() => dispatch(endAsDrawViaAgreement())}>End as Draw</button>
    <button onClick={() => dispatch(whiteResigns())}>White Resigns</button>
    <button onClick={() => dispatch(blackResigns())}>Black Resigns</button>
    <button onClick={() => dispatch(reset())}>{currentGameStatus < 4 ? 'Reset' : 'New Game'}</button>
    <br />
    <PlayerInfo color={orientation === 'white' ? 'black' : 'white'} mode={'local'} />
    <br />
    <ActiveBoard orientation={orientation} mode={'local'} />
    <Result currentGameStatus={currentGameStatus} />
    <br />
    <PlayerInfo color={orientation} mode={'local'} />
    <br />
    <MoveHistory mode={'local'} />
  </main>
}

export default LocalGame