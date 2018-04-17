const ApplicationError = require('../application-error')

module.exports = class UserAlreadyHasToken extends ApplicationError {
  constructor (message, type) {
    message = typeof (message) === 'string' ? message : 'You already have a active token'
    type = typeof (type) === 'string' ? type : 'api'
    super(400, message, type)
  }
}
