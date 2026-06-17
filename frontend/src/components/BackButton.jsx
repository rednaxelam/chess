import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

// navigates up the site hierarchy

const BackButton = () => {
  const navigate = useNavigate()
  const currentPathname = useLocation().pathname
  const isGameFinished = useSelector(({ onlineGame }) => onlineGame?.gameState.gameStatus >= 4)
  if (currentPathname === '/' || (currentPathname === '/online/active-game' && !isGameFinished)) return null
  else {
    const parentPathname = currentPathname === '/' ? null : currentPathname.slice(0, currentPathname.lastIndexOf('/'))
    return <button onClick={() => navigate(parentPathname)}>◀</button>
  }
}

export default BackButton

