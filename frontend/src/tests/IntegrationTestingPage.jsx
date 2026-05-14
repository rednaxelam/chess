// import IntegrationTestingPage from './tests/IntegrationTestingPage.jsx'
// import initializeSocket from './services/initializeSocket.js'
// initializeSocket()

import { useSelector } from 'react-redux'
import { emitGetUserState,
  emitGetGameStatus,
  emitGetNewName,
  emitQueueJoin,
  emitQueueLeave,
  emitPlayMove,
  emitMakeDrawOffer,
  emitResetDrawOffers,
  emitNoDrawOffers,
  emitWantDrawOffers,
  emitRecoverAllOnlineGameState,
  emitRecoverGameState,
  emitRecoverDrawState,
  emitCheckVersionInfo,
} from '../services/socketEmitters'
import { useState } from 'react'

const handleInputChange = stateUpdater => {
  return ({ target }) => stateUpdater(target.value)
}

const TextualInput = ({ nom, state, stateUpdater }) => {
  return <>
    <span>{nom}: </span>
    <input
      type="text"
      name={nom}
      id={nom}
      value={state}
      onChange={handleInputChange(stateUpdater)}
    />
    <br />
  </>
}

function IntegrationTestingPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [promoteTo, setPromoteTo] = useState('')
  const [gameStateVersion, setGameStateVersion] = useState('')
  const [drawStateVersion, setDrawStateVersion] = useState('')

  const onlineUserState = useSelector(({ onlineUser }) => onlineUser)
  const onlineGameState = useSelector(({ onlineGame }) => onlineGame)
  const errorState = useSelector(({ error }) => error)

  const submitPlayMoveForm = (event) => {
    event.preventDefault()
    const moveInfo = {
      from: from.split(' ').map((str) => Number(str)),
      to: to.split(' ').map((str) => Number(str)),
      promoteTo: promoteTo
    }
    emitPlayMove(moveInfo, Number(gameStateVersion))
    setFrom('')
    setTo('')
    setPromoteTo('')
    setGameStateVersion('')
  }

  return (
    <>
      <p>Online User State:</p>
      <p>{JSON.stringify(onlineUserState)}</p>
      <p>Online Game State:</p>
      <p>{JSON.stringify(onlineGameState)}</p>
      <p>Error State:</p>
      <p>{JSON.stringify(errorState)}</p>
      <p>Online User Emitters:</p>
      <button onClick={emitGetUserState}>emitGetUserState</button>
      <button onClick={emitGetGameStatus}>emitGetGameStatus</button>
      <button onClick={emitGetNewName}>emitGetNewName</button>
      <p>Matchmaking Queue Emitters:</p>
      <button onClick={emitQueueJoin}>emitQueueJoin</button>
      <button onClick={emitQueueLeave}>emitQueueLeave</button>
      <p>Online Game Emitters:</p>
      <form onSubmit={submitPlayMoveForm}>
        <TextualInput nom={'from'} state={from} stateUpdater={setFrom}/>
        <TextualInput nom={'to'} state={to} stateUpdater={setTo}/>
        <TextualInput nom={'promoteTo'} state={promoteTo} stateUpdater={setPromoteTo}/>
        <TextualInput nom={'gameStateVersion'} state={gameStateVersion} stateUpdater={setGameStateVersion}/>
        <button type='submit'>play move</button>
      </form>
      <br />
      <div>draw options</div>
      <button onClick={() => emitMakeDrawOffer(Number(drawStateVersion))}>emitDrawMakeOffer</button>
      <button onClick={() => emitResetDrawOffers(Number(drawStateVersion))}>emitDrawResetOffers</button>
      <button onClick={() => emitNoDrawOffers(Number(drawStateVersion))}>emitDrawNoOffers</button>
      <button onClick={() => emitWantDrawOffers(Number(drawStateVersion))}>emitDrawWantOffers</button>
      <br />
      <TextualInput nom={'drawStateVersion'} state={drawStateVersion} stateUpdater={setDrawStateVersion}/>
      <br />
      <div>other emitters</div>
      <button onClick={emitRecoverAllOnlineGameState}>emitRecoverAllOnlineGameState</button>
      <button onClick={emitRecoverGameState}>emitRecoverGameState</button>
      <button onClick={emitRecoverDrawState}>emitRecoverDrawState</button>
      <button onClick={emitCheckVersionInfo}>emitCheckVersionInfo</button>
    </>
  )
}

export default IntegrationTestingPage