import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useRef, useState, useEffect } from 'react'

import blackPawn from '../assets/black-pawn.svg'
import blackBishop from '../assets/black-bishop.svg'
import blackKnight from '../assets/black-knight.svg'
import blackRook from '../assets/black-rook.svg'
import blackQueen from '../assets/black-queen.svg'
import blackKing from '../assets/black-king.svg'
import whitePawn from '../assets/white-pawn.svg'
import whiteBishop from '../assets/white-bishop.svg'
import whiteKnight from '../assets/white-knight.svg'
import whiteRook from '../assets/white-rook.svg'
import whiteQueen from '../assets/white-queen.svg'
import whiteKing from '../assets/white-king.svg'

const pieceSVGDictionary = {
  'black-pawn': blackPawn,
  'black-bishop': blackBishop,
  'black-knight': blackKnight,
  'black-rook': blackRook,
  'black-queen': blackQueen,
  'black-king': blackKing,
  'white-pawn': whitePawn,
  'white-bishop': whiteBishop,
  'white-knight': whiteKnight,
  'white-rook': whiteRook,
  'white-queen': whiteQueen,
  'white-king': whiteKing,
}

const getPieceSVGSource = (pieceColor, pieceType) => pieceSVGDictionary[pieceColor + '-' + pieceType]


const StyledSquare = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  & img {
    height: 100%;
    width: 100%;
  }
`

// const pickUpPiece = (event, imgRef, setImgStyle) => {
//   event.preventDefault()
//   const imgDOM = imgRef.current
//   const imgRect = imgDOM.getBoundingClientRect()
//   const xval = event.clientX - 0.5 * imgRect.width
//   const yval = event.clientY - 0.5 * imgRect.height
//   setImgStyle({ position: 'absolute', left: `${xval - imgRect.x}px`, top: `${yval - imgRect.y}px` })
//   const callDragPiece = (event) => dragPiece(event, imgRect.x, imgRect.y, imgRect.width, imgRect.height, setImgStyle)
//   document.addEventListener('mousemove', callDragPiece)
//   document.addEventListener('mouseup', (event) => {document.removeEventListener('mousemove', callDragPiece)}, { once: true })
// }

const dragPiece = (event, startX, startY, imgWidth, imgHeight, setImgStyle) => {
  event.preventDefault()
  const xval = event.clientX - 0.5 * imgWidth
  const yval = event.clientY - 0.5 * imgHeight
  setImgStyle({ position: 'absolute', left: `${xval - startX}px`, top: `${yval - startY}px`, zIndex: 9999 })
}


const Square = ({ bgColor, pieceColor, pieceType, pieceIsBeingDragged, handleMouseDown }) => {

  const imgRef = useRef(null)
  const [imgStyle, setImgStyle] = useState({ position: 'absolute' })

  useEffect(() => {
    if (pieceIsBeingDragged) {
      console.log('hello')
      const imgDOM = imgRef.current
      const imgRect = imgDOM.getBoundingClientRect()
      const callDragPiece = (event) => dragPiece(event, imgRect.x, imgRect.y, imgRect.width, imgRect.height, setImgStyle)
      document.addEventListener('mousemove', callDragPiece)
    }
  }, [pieceIsBeingDragged])

  return (
    <StyledSquare style={{ backgroundColor: bgColor }}>
      {(pieceType && pieceColor)
        ? <img
          src={getPieceSVGSource(pieceColor, pieceType)} alt={pieceColor + ' ' + pieceType}
          ref={imgRef}
          style={imgStyle}
          onMouseDown={handleMouseDown}/>
        : <></>}
    </StyledSquare>
  )
}

Square.propTypes = {
  bgColor: PropTypes.string.isRequired,
  pieceType: PropTypes.string,
  playerColor: PropTypes.string,
  pieceIsBeingDragged: PropTypes.bool,
}

export default Square