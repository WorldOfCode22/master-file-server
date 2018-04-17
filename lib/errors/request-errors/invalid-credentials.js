const ApplicationError = require('../application-error')

module.exports = class InvalidCredentials extends ApplicationError {
  constructor (message, type) {
    message = typeof (message) === 'string' ? message : 'Invalid credential(s) given'
    type = typeof (type) === 'string' ? type : 'api'
    super(403, message, type)
  }
}
