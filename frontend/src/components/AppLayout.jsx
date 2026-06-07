import { Outlet, useNavigate } from 'react-router'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import BackButton from './BackButton'
import User from './User'
import initializeSocket from '../services/initializeSocket'

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const AppLayout = () => {
  // socket initialization code assumes that the layout is only mounted once
  const startupSocketInitializationNeeded = useRef(localStorage.getItem('token') ? true : false)
  const navigate = useNavigate()
  const userState = useSelector(({ onlineUser }) => onlineUser)
  const isInActiveGame = userState && userState.onlineGameStatus === 2

  useEffect(() => {
    if (isInActiveGame) {
      navigate('/online-game')
    }
  }, [isInActiveGame, navigate])

  useEffect(() => {
    if (startupSocketInitializationNeeded.current) {
      initializeSocket()
      startupSocketInitializationNeeded.current = false
    }
  }, [])

  return (
    <>
      <StyledHeader>
        <BackButton />
        <User />
      </StyledHeader>
      <Outlet />
    </>
  )
}

export default AppLayout