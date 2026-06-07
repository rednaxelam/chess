import { useSelector } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { emitGetNewName } from '../services/socketEmitters'

const StyledUserContents = styled.ul`
  position: absolute;
  z-index: 99;
  border-left: 1px solid rgba(0, 0, 0);
  border-right: 1px solid rgba(0, 0, 0);
  border-bottom: 1px solid rgba(0, 0, 0);
  background-color: white;
  top: 100%;
  right: 0;
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 1px;
  margin: 3px;
  -webkit-user-select: none;
  user-select: none;

  & li {
    border-top: 1px solid rgba(0, 0, 0);
  }
`

const StyledUser = styled.div`
  position: relative;
`

const UserContents = ({ currentUserState, isExpanded }) => {
  if (currentUserState === null || !isExpanded) return null
  else return <StyledUserContents>
    {/* to do: disable the new name option after emitGetNewName and enable it again after receiving a new name */}
    {/* also disable functionality while in an active online game */}
    <li onClick={emitGetNewName}>New Name? ↻</li>
    <li>Saved Games</li>
  </StyledUserContents>

}

const UserToggle = ({ currentUserState, isExpanded, handleClick }) => {
  if (currentUserState === null) {
    return <em>
      not signed in
    </em>
  } else {
    const { onlineGameStatus } = currentUserState
    const onlineGameStatusDescription = onlineGameStatus === 0 ? '(online)' : onlineGameStatus === 1 ? '(in queue)' : '(in game)'
    return <button onClick={handleClick}>
      <em>{onlineGameStatusDescription + ' '}</em>
      {currentUserState.username} {isExpanded ? '↑' : '↓'}
    </button>
  }
}

const User = () => {
  const currentUserState = useSelector(({ onlineUser }) => onlineUser)
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseDownOutsideComponent = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDownOutsideComponent)
    return () => document.removeEventListener('mousedown', handleMouseDownOutsideComponent)
  })

  return <div ref={containerRef} style={{ marginLeft: 'auto', width: 'fit-content' }}>
    <StyledUser>
      <UserToggle currentUserState={currentUserState} isExpanded={isExpanded} handleClick={() => setIsExpanded(!isExpanded)}/>
      <UserContents currentUserState={currentUserState} isExpanded={isExpanded}/>
    </StyledUser>
  </div>
}

export default User