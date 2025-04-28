import styled from 'styled-components'
import { useRef, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { playMove } from '../reducers/localGameReducer'

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

const dragPiece = (event, startX, startY, imgWidth, imgHeight, setImgStyle) => {
  event.preventDefault()
  const xval = event.clientX - 0.5 * imgWidth
  const yval = event.clientY - 0.5 * imgHeight
  setImgStyle({ position: 'absolute', pointerEvents: 'none', left: `${xval - startX}px`, top: `${yval - startY}px`, zIndex: 9999 })
}


const Square = ({ bgColor, pieceColor, pieceType, pieceIsBeingDragged, handleMouseDown, moveCoords, setDraggedPieceCoords }) => {
  const dispatch = useDispatch()
  const imgRef = useRef(null)
  const squareRef = useRef(null)
  const [imgStyle, setImgStyle] = useState({ position: 'absolute', pointerEvents: 'none' })

  useEffect(() => {
    if (pieceIsBeingDragged) {
      const imgDOM = imgRef.current
      const imgRect = imgDOM.getBoundingClientRect()
      const callDragPiece = (event) => dragPiece(event, imgRect.x, imgRect.y, imgRect.width, imgRect.height, setImgStyle)
      window.onmousemove = callDragPiece
    } else {
      setImgStyle({ position: 'absolute', pointerEvents: 'none' })
    }
  }, [pieceIsBeingDragged])

  useEffect(() => {
    const squareDom = squareRef.current
    if (moveCoords) {
      const handleMouseUp = (event) => {
        window.onmouseup = null
        window.onmousemove = null
        event.stopPropagation()
        setDraggedPieceCoords(null)
        dispatch(playMove(moveCoords))
      }
      squareDom.onmouseup = handleMouseUp
    } else {
      squareDom.onmouseup = null
    }
  }, [moveCoords])

  return (
    <StyledSquare style={{ backgroundColor: bgColor }} ref={squareRef} onMouseDown={handleMouseDown}>
      {(pieceType && pieceColor)
        ? <img
          src={getPieceSVGSource(pieceColor, pieceType)} alt={pieceColor + ' ' + pieceType}
          ref={imgRef}
          style={imgStyle}
          draggable={false}/>
        : <></>}
    </StyledSquare>
  )
}

export default Square