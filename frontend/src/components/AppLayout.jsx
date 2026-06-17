import { Outlet, useNavigate, useLocation } from 'react-router'
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
  const currentPathname = useLocation().pathname
  const userState = useSelector(({ onlineUser }) => onlineUser)

  const isInActiveGame = userState && userState.onlineGameStatus === 2
  const hasNoToken = !localStorage.getItem('token')

  useEffect(() => {
    if (isInActiveGame) {
      navigate('/online/active-game')
    } else if (hasNoToken && currentPathname.includes('/online')) {
      navigate('/')
    }
  }, [isInActiveGame, navigate, hasNoToken, currentPathname])

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