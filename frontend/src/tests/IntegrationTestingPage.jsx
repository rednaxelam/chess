// import initializeSocket from './services/initializeSocket.js'
// initializeSocket()

import { useSelector } from 'react-redux'
import { emitGetUserState, emitGetGameStatus, emitGetNewName, emitQueueJoin, emitQueueLeave } from '../services/socketEmitters'
function IntegrationTestingPage() {
  const onlineUserState = useSelector(({ onlineUser }) => onlineUser)
  const onlineGameState = useSelector(({ onlineGame }) => onlineGame)
  const errorState = useSelector(({ error }) => error)

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
    </>
  )
}

export default IntegrationTestingPage