import ActiveBoard from '../chess-board/ActiveBoard'
import OnlineGameDrawMenu from '../game-ui/OnlineGameDrawMenu'

const OnlineGame = () => {
  return <main>
    <ActiveBoard orientation={'auto'} mode={'online'} />
    <br />
    <OnlineGameDrawMenu />
  </main>
}

export default OnlineGame