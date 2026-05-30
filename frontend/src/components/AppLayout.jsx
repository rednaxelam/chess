import { Outlet, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import BackButton from './BackButton'
import User from './User'

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const AppLayout = () => {
  const navigate = useNavigate()
  const onlineUserState = useSelector(state => state)
  const isInActiveGame = onlineUserState && onlineUserState.onlineGameStatus === 2

  useEffect(() => {
    if (isInActiveGame) {
      navigate('/online-game')
    }
  }, [isInActiveGame, navigate])

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