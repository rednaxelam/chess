import PropTypes from 'prop-types'
import styled from 'styled-components'

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
  border-width: 0px 0px 1px 1px;
  border-color: black;
  border-style: solid;

  & img {
    height: 100%;
    width: 100%;
  }
`

const Square = ({ bgColor, pieceColor, pieceType, }) => {

  return (
    <StyledSquare style={{ backgroundColor: bgColor }}>
      {(pieceType && pieceColor)
        ? <img src={getPieceSVGSource(pieceColor, pieceType)} alt={pieceColor + ' ' + pieceType} />
        : <></>}
    </StyledSquare>
  )
}

Square.propTypes = {
  bgColor: PropTypes.string.isRequired,
  pieceType: PropTypes.string,
  playerColor: PropTypes.string,
}

export default Square