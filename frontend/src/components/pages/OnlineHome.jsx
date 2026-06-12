import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { emitQueueJoin, emitQueueLeave } from '../../services/socketEmitters'

const MatchmakingButton = ({ onlineGameStatus, isAwaitingQueueResponse, setIsAwaitingQueueResponse }) => {
  if (!isAwaitingQueueResponse) {
    if (onlineGameStatus === 0) {
      return <button onClick={() => {emitQueueJoin(); setIsAwaitingQueueResponse(true)}}>
        join queue
      </button>
    } else {
      return <button onClick={() => {emitQueueLeave(); setIsAwaitingQueueResponse(true)}}>
        leave queue
      </button>
    }
  } else {
    if (onlineGameStatus === 0) {
      return <button>
        joining queue...
      </button>
    } else {
      return <button>
        leaving queue...
      </button>
    }
  }
}

const OnlineHome = () => {
  const [isAwaitingQueueResponse, setIsAwaitingQueueResponse] = useState(false)
  const userState = useSelector(({ onlineUser }) => onlineUser)

  const onlineGameStatus = userState !== null ? userState.onlineGameStatus : null

  useEffect(() => {
    setIsAwaitingQueueResponse(false)
  }, [onlineGameStatus])

  if (!userState) return <p>signing in...</p>
  else return <main>
    <MatchmakingButton onlineGameStatus={onlineGameStatus}
      isAwaitingQueueResponse={isAwaitingQueueResponse}
      setIsAwaitingQueueResponse={setIsAwaitingQueueResponse} />
    <p>saved games...</p>
  </main>
}

export default OnlineHome