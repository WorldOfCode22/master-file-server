const ApplicationError = require('../application-error')

module.exports = class CannotAppendFile extends ApplicationError {
  constructor (message, type) {
    message = typeof (message) === 'string' ? message : 'A internal service error has prevented a file from being edited'
    type = typeof (type) === 'string' ? type : 'api'
    super(500, message, type)
  }
}
