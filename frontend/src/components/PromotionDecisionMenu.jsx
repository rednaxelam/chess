import styled from 'styled-components'
import { useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { playMove } from '../reducers/localGameReducer'

import blackBishop from '../assets/black-bishop.svg'
import blackKnight from '../assets/black-knight.svg'
import blackRook from '../assets/black-rook.svg'
import blackQueen from '../assets/black-queen.svg'
import whiteBishop from '../assets/white-bishop.svg'
import whiteKnight from '../assets/white-knight.svg'
import whiteRook from '../assets/white-rook.svg'
import whiteQueen from '../assets/white-queen.svg'

const pieceSVGDictionary = {
  'black-bishop': blackBishop,
  'black-knight': blackKnight,
  'black-rook': blackRook,
  'black-queen': blackQueen,
  'white-bishop': whiteBishop,
  'white-knight': whiteKnight,
  'white-rook': whiteRook,
  'white-queen': whiteQueen,
}

const getPieceSVGSource = (pieceColor, pieceType) => pieceSVGDictionary[pieceColor + '-' + pieceType]

const MenuContainer = styled.div`
  position: absolute;
  left: -2px;
  width: 100%;
  background-color: rgb(214, 214, 180);
  border: 2px solid black;
  border-radius: 5px;
  display: flex;
  flex-wrap: wrap;
  z-index: 9999;

  & img {
    transition: transform .2s;

    &:hover {
      transform: scale(1.1);
    }
  }

`

const PromotionDecisionMenu = ({ pieceColor, moveInfo, boardPosition, setDraggedPieceInfo, setPromotionMenuCoords }) => {
  const dispatch = useDispatch()
  const queenRef = useRef(null)
  const knightRef = useRef(null)
  const rookRef = useRef(null)
  const bishopRef = useRef(null)

  const handlePromotionChoice = (pieceType) => (event) => {
    event.stopPropagation()
    window.onmousedown = null
    setDraggedPieceInfo(null)
    setPromotionMenuCoords(null)
    dispatch(playMove({ ...moveInfo, promoteTo: pieceType }))
  }

  useEffect(() => {
    queenRef.current.onmousedown = handlePromotionChoice('queen')
    knightRef.current.onmousedown = handlePromotionChoice('knight')
    rookRef.current.onmousedown = handlePromotionChoice('rook')
    bishopRef.current.onmousedown = handlePromotionChoice('bishop')
  }, [])

  return <MenuContainer style={boardPosition === 'top' ? { flexDirection: 'column' } : { flexDirection: 'column-reverse', top: '-300%' }}>
    <img src={getPieceSVGSource(pieceColor, 'queen')} ref={queenRef} draggable={false} />
    <img src={getPieceSVGSource(pieceColor, 'knight')} ref={knightRef} draggable={false} />
    <img src={getPieceSVGSource(pieceColor, 'rook')} ref={rookRef} draggable={false} />
    <img src={getPieceSVGSource(pieceColor, 'bishop')} ref={bishopRef} draggable={false} />
  </MenuContainer>
}

export default PromotionDecisionMenu
