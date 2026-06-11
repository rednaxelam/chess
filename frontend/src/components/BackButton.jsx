import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import styled from 'styled-components'

// navigates up the site hierarchy

const BackButton = () => {
  const navigate = useNavigate()
  const currentPathname = useLocation().pathname
  if (currentPathname === '/') return null
  else {
    const parentPathname = currentPathname === '/' ? null : currentPathname.slice(0, currentPathname.lastIndexOf('/') + 1)
    return <button onClick={() => navigate(parentPathname)}>◀</button>
  }
}

export default BackButton

