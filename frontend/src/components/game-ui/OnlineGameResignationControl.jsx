import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { emitResign } from '../../services/socketEmitters'


const OnlineGameResignationControl = () => {
  const [isConfirmationDisplayed, setIsConfirmationDisplayed] = useState(false)
  const [isResignationEmitted, setIsResignationEmitted] = useState(false)
  const gameStateVersion = useSelector(({ onlineGame }) => onlineGame?.gameState.version)
  const isGameFinished = useSelector(({ onlineGame }) => onlineGame?.gameState.gameStatus >= 4)

  useEffect(() => {
    setIsConfirmationDisplayed(false)
  }, [gameStateVersion])

  if (!(typeof gameStateVersion === 'number') || isGameFinished) {
    return null
  } else if (isResignationEmitted) {
    return <div style={{ border: '1px solid black' }}>
      <p>resigning...</p>
    </div>
  } else if (!isConfirmationDisplayed) {
    return <div style={{ border: '1px solid black' }}>
      <button onClick={() => setIsConfirmationDisplayed(true)}>resign</button>
    </div>
  } else {
    return <div style={{ border: '1px solid black' }}>
      <p>Confirm Resignation</p>
      <button onClick={() => {emitResign(); setIsResignationEmitted(true)}}>Confirm</button>
      <button onClick={() => setIsConfirmationDisplayed(false)}>Cancel</button>
    </div>
  }

}

export default OnlineGameResignationControl