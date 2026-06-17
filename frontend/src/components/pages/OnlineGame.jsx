import ActiveBoard from '../chess-board/ActiveBoard'
import OnlineGameDrawMenu from '../OnlineGameDrawMenu'

const OnlineGame = () => {
  return <main>
    <ActiveBoard orientation={'auto'} mode={'online'} />
    <br />
    <OnlineGameDrawMenu />
  </main>
}

export default OnlineGame