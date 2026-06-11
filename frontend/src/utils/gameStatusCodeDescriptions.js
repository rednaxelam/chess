const gameStatusCodeDescriptions = {
  0: 'White to play',
  1: 'Black to play',
  2: 'White to play, previous move rejected',
  3: 'Black to play, previous move rejected',
  4: 'White won via checkmate',
  5: 'Black won via checkmate',
  6: 'White won via resignation',
  7: 'Black won via resignation',
  8: 'White won via timeout',
  9: 'Black won via timeout',
  10: 'White won via abandonment',
  11: 'Black won via abandonment',
  12: 'Draw via agreement',
  13: 'Draw via stalemate',
  14: 'Draw via fifty-move rule',
  15: 'Draw via threefold repetition',
  16: 'Draw via insufficient material',
  17: 'Draw via timeout vs insufficient material',
}

export default gameStatusCodeDescriptions