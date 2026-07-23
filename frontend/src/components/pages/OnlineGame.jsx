import ActiveBoard from '../chess-board/ActiveBoard'
import OnlineGameDrawMenu from '../game-ui/OnlineGameDrawMenu'
import OnlineGameResignationControl from '../game-ui/OnlineGameResignationControl'
import PlayerInfo from '../game-ui/PlayerInfo'
import MoveHistory from '../game-ui/MoveHistory'
import { useSelector } from 'react-redux'

const OnlineGame = () => {
  const playerColor = useSelector(({ onlineGame }) => onlineGame?.gameState.playerColor)
  if (!playerColor) return <p>loading...</p>

  return <main>
    <PlayerInfo color={playerColor === 'white' ? 'black' : 'white'} mode={'online'} />
    <br />
    <ActiveBoard orientation={'auto'} mode={'online'} />
    <br />
    <PlayerInfo color={playerColor} mode={'online'} />
    <br />
    <OnlineGameDrawMenu />
    <br />
    <OnlineGameResignationControl />
    <br />
    <MoveHistory mode={'online'}/>
  </main>
}

export default OnlineGame