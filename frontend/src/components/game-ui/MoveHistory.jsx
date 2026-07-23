import { useSelector, useDispatch } from 'react-redux'
import { displayLocalPly, displayOnlinePly, displayActiveLocalBoard, displayActiveOnlineBoard } from '../../reducers/moveHistoryReducer'

const Move = ({ mode, moveNumber, highlightPly, finalPlyColor, whiteAlgebraicNotation, blackAlgebraicNotation }) => {
  const dispatch = useDispatch()
  const displayPly = mode === 'local' ? displayLocalPly : displayOnlinePly
  const displayActiveBoard = mode === 'local' ? displayActiveLocalBoard : displayActiveOnlineBoard
  const dispatchDisplayPlyWhite = () => dispatch(finalPlyColor === 'white' ? displayActiveBoard() : displayPly((moveNumber - 1) * 2))
  const dispatchDisplayPlyBlack = () => dispatch(finalPlyColor === 'black' ? displayActiveBoard() : displayPly((moveNumber - 1) * 2 + 1))

  return <tr>
    <td>{moveNumber}.</td>
    <td onClick={dispatchDisplayPlyWhite}
      style={highlightPly === 'white' ? { backgroundColor: 'yellow' } : {}}>
      {whiteAlgebraicNotation}
    </td>
    {blackAlgebraicNotation && <td onClick={dispatchDisplayPlyBlack}
      style={highlightPly === 'black' ? { backgroundColor: 'yellow' } : {}}>
      {blackAlgebraicNotation}
    </td>}
  </tr>
}

const MoveHistoryContents = ({ moveHistory, mode, plyToBeHighlighted }) => {
  const MoveArray = []
  for (let i = 0; i < moveHistory.length / 2; i++) {
    MoveArray.push(
      <Move key={i + 1}
        mode={mode}
        moveNumber={i + 1}
        highlightPly={plyToBeHighlighted === i * 2 ? 'white' : plyToBeHighlighted === i * 2 + 1 ? 'black' : null}
        finalPlyColor={i * 2 === moveHistory.length - 1 ? 'white' : i * 2 + 1 === moveHistory.length - 1 ? 'black' : null}
        whiteAlgebraicNotation={moveHistory[i * 2].split(' ')[1]}
        blackAlgebraicNotation={i * 2 + 1 <= moveHistory.length - 1 ? moveHistory[i * 2 + 1].split(' ')[1] : null}/>
    )
  }

  return <table>
    <tbody>
      {MoveArray}
    </tbody>
  </table>
}

const GameOutcome = ({ gameOutcome }) => {
  if (gameOutcome < 4) {
    return <p>game in progress</p>
  } else if (gameOutcome > 11) {
    return <p>½–½</p>
  } else {
    if (gameOutcome % 2 === 0) {
      return <p>1-0</p>
    } else {
      return <p>0-1</p>
    }
  }
}

const LocalMoveHistory = () => {
  const dispatch = useDispatch()
  const moveHistory = useSelector(({ localGame }) => localGame.currentGameState.gameHistory.moveHistory)
  const gameOutcome = useSelector(({ localGame }) => localGame.currentGameState.gameHistory.gameOutcome)
  const localPly = useSelector(({ moveHistory }) => moveHistory.localPly)
  const plyToBeHighlighted = localPly || localPly === 0 ? localPly : moveHistory.length - 1

  const handleStartNavigation = () => {
    if (moveHistory.length === 0) return
    else if (localPly > -1) dispatch(displayLocalPly(-1))
  }
  const handleBackNavigation = () => {
    if (moveHistory.length === 0) return
    else if (localPly === null) dispatch(displayLocalPly(moveHistory.length - 2))
    else if (localPly > -1) dispatch(displayLocalPly(localPly - 1))
  }
  const handleForwardNavigation = () => {
    if (moveHistory.length === 0) return
    else if (localPly === null) return
    else if (localPly < moveHistory.length - 2) dispatch(displayLocalPly(localPly + 1))
    else if (localPly === moveHistory.length - 2) dispatch(displayActiveLocalBoard())
  }
  const handleLiveNavigation = () => {
    if (moveHistory.length === 0) return
    else if (localPly !== null) dispatch(displayActiveLocalBoard())
  }


  return <div>
    <p>Move History</p>
    <MoveHistoryContents moveHistory={moveHistory} mode={'local'} plyToBeHighlighted={plyToBeHighlighted}/>
    <GameOutcome gameOutcome={gameOutcome} />
    <div>
      <button onClick={handleStartNavigation}>⏮</button>
      <button onClick={handleBackNavigation}>◀</button>
      <button onClick={handleForwardNavigation}>▶</button>
      <button onClick={handleLiveNavigation}>⏭</button>
    </div>
  </div>
}

const OnlineMoveHistory = () => {
  const dispatch = useDispatch()
  const moveHistory = useSelector(({ onlineGame }) => onlineGame?.gameState.gameHistory.moveHistory)
  const gameOutcome = useSelector(({ onlineGame }) => onlineGame?.gameState.gameHistory.gameOutcome)
  const onlinePly = useSelector(({ moveHistory }) => moveHistory.onlinePly)
  const plyToBeHighlighted = onlinePly || onlinePly === 0 ? onlinePly : moveHistory.length - 1

  if (!moveHistory) return null

  const handleStartNavigation = () => {
    if (moveHistory.length === 0) return
    else if (onlinePly > -1) dispatch(displayOnlinePly(-1))
  }
  const handleBackNavigation = () => {
    if (moveHistory.length === 0) return
    else if (onlinePly === null) dispatch(displayOnlinePly(moveHistory.length - 2))
    else if (onlinePly > -1) dispatch(displayOnlinePly(onlinePly - 1))
  }
  const handleForwardNavigation = () => {
    if (moveHistory.length === 0) return
    else if (onlinePly === null) return
    else if (onlinePly < moveHistory.length - 2) dispatch(displayOnlinePly(onlinePly + 1))
    else if (onlinePly === moveHistory.length - 2) dispatch(displayActiveOnlineBoard())
  }
  const handleLiveNavigation = () => {
    if (moveHistory.length === 0) return
    else if (onlinePly !== null) dispatch(displayActiveOnlineBoard())
  }

  return <div>
    <p>Move History</p>
    <MoveHistoryContents moveHistory={moveHistory} mode={'online'} plyToBeHighlighted={plyToBeHighlighted}/>
    <GameOutcome gameOutcome={gameOutcome} />
    <div>
      <button onClick={handleStartNavigation}>⏮</button>
      <button onClick={handleBackNavigation}>◀</button>
      <button onClick={handleForwardNavigation}>▶</button>
      <button onClick={handleLiveNavigation}>⏭</button>
    </div>
  </div>
}

const MoveHistory = ({ mode }) => {
  if (mode === 'local') return <LocalMoveHistory />
  else if (mode === 'online') return <OnlineMoveHistory />
  else return null
}

export default MoveHistory