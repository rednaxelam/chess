import ActiveBoard from '../chess-board/ActiveBoard'
import OnlineGameDrawMenu from '../game-ui/OnlineGameDrawMenu'
import OnlineGameResignationControl from '../game-ui/OnlineGameResignationControl'

const OnlineGame = () => {
  return <main>
    <ActiveBoard orientation={'auto'} mode={'online'} />
    <br />
    <OnlineGameDrawMenu />
    <br />
    <OnlineGameResignationControl />
  </main>
}

export default OnlineGame