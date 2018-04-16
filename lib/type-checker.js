const {MissingOrInvalidField} = require('./errors')
const typeChecker = {}

typeChecker.checkType = (toCheck, type) => {
  // eslint-disable-next-line
  if (typeof (toCheck) === type) {
    return true
  }
  throw new MissingOrInvalidField()
}
module.exports = typeChecker
