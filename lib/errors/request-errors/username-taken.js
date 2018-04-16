const ApplicationError = require('../application-error')

module.exports = class UsernameTaken extends ApplicationError {
  constructor (message, type) {
    message = typeof (message) === 'string' ? message : 'Username already taken'
    type = typeof (type) === 'string' ? type : 'api'
    super(400, message, type)
  }
}
