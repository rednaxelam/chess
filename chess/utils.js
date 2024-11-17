function validateCoordinates(coords) {
  if (!Array.isArray(coords)) {
    throw new Error('coordinates must be supplied as an array')
  } else if (coords.length !== 2) {
    throw new Error('coordinates must be an array of length 2')
  } else if (!Number.isInteger(coords[0]) || !Number.isInteger(coords[1])) {
    throw new Error('coordinates must be integers')
  } else if (coords[0] < 0 || coords[0] > 7 || coords[1] < 0 || coords[1] > 7) {
    throw new Error('x and y coordinates must be between 0 and 7')
  }
}

function validateTestParameter(test) {
  if (test !== 'test' && test !== undefined) {
    throw new Error(`Unexpected argument ${test} received. Use 'test' for testing mode and don't supply an argument if not testing`)
  }
}

module.exports = {
  validateCoordinates,
  validateTestParameter,
}