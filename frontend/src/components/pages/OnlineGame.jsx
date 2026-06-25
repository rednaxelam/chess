import ActiveBoard from '../chess-board/ActiveBoard'
import OnlineGameDrawMenu from '../game-ui/OnlineGameDrawMenu'
import OnlineGameResignationControl from '../game-ui/OnlineGameResignationControl'
import PlayerInfo from '../game-ui/PlayerInfo'
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
  </main>
}

export default OnlineGame