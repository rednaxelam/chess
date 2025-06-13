/* eslint-disable react-hooks/exhaustive-deps */
import styled from 'styled-components'
import { useRef, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { playMove } from '../reducers/localGameReducer'
import PromotionDecisionMenu from './PromotionDecisionMenu'

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

import overlayBlackLoss from '../assets/overlay-black-loss.svg'
import overlayWhiteLoss from '../assets/overlay-white-loss.svg'
import overlayDraw from '../assets/overlay-draw.svg'
import overlayWin from '../assets/overlay-win.svg'

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
  position: relative;

  & img.square-contents {
    height: 100%;
    width: 100%;
  }

  & img.piece-overlay {
    height: 50%;
    width: 50%;
    position: absolute;
    z-index: 9999;
    right: -10%;
    top: -10%
  }

  & div.hover-border {
    height: 100%;
    width: 100%;
    z-index: 900;
    position: absolute;
    box-sizing: border-box;
  }

  & div.hover-border:hover {
    border: 3px solid rgba(104, 104, 62, 0.527);
  }
`

const dragPiece = (event, startX, startY, imgWidth, imgHeight, setImgStyle) => {
  event.preventDefault()
  const xval = event.clientX - 0.5 * imgWidth
  const yval = event.clientY - 0.5 * imgHeight
  setImgStyle({ position: 'absolute', pointerEvents: 'none', left: `${xval - startX}px`, top: `${yval - startY}px`, zIndex: 999 })
}


const Square = ({ bgColor, pieceColor, pieceType, pieceIsBeingDragged, displayPromotionMenu, orientation, moveInfo, colorOfWinner, handleMouseDown, setDraggedPieceInfo, setPromotionMenuCoords, colorOfPlayerInCheck, highlightOnHover }) => {
  const dispatch = useDispatch()
  const imgRef = useRef(null)
  const squareRef = useRef(null)
  const [imgStyle, setImgStyle] = useState({ position: 'absolute', pointerEvents: 'none' })
  if (colorOfPlayerInCheck && colorOfPlayerInCheck === pieceColor && pieceType === 'king') {
    bgColor = bgColor === 'rgb(186,191,100)' ? 'rgb(209, 60, 60)' : 'rgb(248, 126, 126)'
  }

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
    if (moveInfo) {
      if ((moveInfo.to[0] === 0 || moveInfo.to[0] === 7) && moveInfo.pieceType === 'pawn') {
        const handleMouseUp = (event) => {
          window.onmouseup = null
          window.onmousemove = null
          event.stopPropagation()
          setPromotionMenuCoords([moveInfo.to[0], moveInfo.to[1]])
        }
        squareDom.onmouseup = handleMouseUp
      } else {
        const handleMouseUp = (event) => {
          window.onmouseup = null
          window.onmousemove = null
          event.stopPropagation()
          setDraggedPieceInfo(null)
          dispatch(playMove(moveInfo))
        }
        squareDom.onmouseup = handleMouseUp
      }
    } else {
      squareDom.onmouseup = null
    }
  }, [moveInfo])

  const pieceImgElement = (pieceColor, pieceType, imgRef, imgStyle) => {
    return <img
      src={getPieceSVGSource(pieceColor, pieceType)}
      alt={pieceColor + ' ' + pieceType}
      ref={imgRef}
      style={imgStyle}
      draggable={false}
      className='square-contents'/>
  }

  const overlayImg = (colorOfWinner, pieceColor, pieceType) => {
    const overlayImgElement = (imgSrc) => {
      return <img
        src={imgSrc}
        draggable={false}
        className='piece-overlay'/>
    }

    if (!colorOfWinner) return <></>
    else {
      if (pieceType === 'king') {
        if (colorOfWinner === 'na') return overlayImgElement(overlayDraw)
        else if (colorOfWinner === pieceColor) return overlayImgElement(overlayWin)
        else if (pieceColor === 'black') return overlayImgElement(overlayBlackLoss)
        else return overlayImgElement(overlayWhiteLoss)
      }
    }
  }

  let squareContents
  if (colorOfWinner) {
    squareContents = <>
      {pieceImgElement(pieceColor, pieceType, imgRef, imgStyle)}
      {overlayImg(colorOfWinner, pieceColor, pieceType)}
    </>
  } else if (displayPromotionMenu) {
    squareContents = <PromotionDecisionMenu
      pieceColor={moveInfo.pieceColor}
      boardPosition={orientation === 'white'
        ? moveInfo.pieceColor === 'white' ? 'top' : 'bottom'
        : moveInfo.pieceColor === 'white' ? 'bottom' : 'top'}
      moveInfo={moveInfo}
      setDraggedPieceInfo={setDraggedPieceInfo}
      setPromotionMenuCoords={setPromotionMenuCoords}/>
  } else if (pieceType && pieceColor) {
    squareContents = <>
      {pieceImgElement(pieceColor, pieceType, imgRef, imgStyle)}
      {highlightOnHover ? <div className='hover-border'></div> : <></>}
    </>
  } else {
    squareContents = <>
      {highlightOnHover ? <div className='hover-border'></div> : <></>}
    </>
  }

  return (
    <StyledSquare style={{ backgroundColor: bgColor }} ref={squareRef} onMouseDown={handleMouseDown}>
      {squareContents}
    </StyledSquare>
  )
}

export default Square