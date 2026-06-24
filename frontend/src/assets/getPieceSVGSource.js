import blackPawn from './black-pawn.svg'
import blackBishop from './black-bishop.svg'
import blackKnight from './black-knight.svg'
import blackRook from './black-rook.svg'
import blackQueen from './black-queen.svg'
import blackKing from './black-king.svg'
import whitePawn from './white-pawn.svg'
import whiteBishop from './white-bishop.svg'
import whiteKnight from './white-knight.svg'
import whiteRook from './white-rook.svg'
import whiteQueen from './white-queen.svg'
import whiteKing from './white-king.svg'

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

export default getPieceSVGSource