const ApplicationError = require('../application-error')

module.exports = class MissingOrInvalidField extends ApplicationError {
  constructor (message, type) {
    message = typeof (message) === 'string' ? message : 'A required field is either missing or is of a invalid type'
    type = typeof (type) === 'string' ? type : 'api'
    super(400, message, type)
  }
}
