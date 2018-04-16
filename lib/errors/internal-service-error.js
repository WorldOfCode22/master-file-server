const ApplicationError = require('./application-error')

module.exports = class InternalServiceError extends ApplicationError {
  constructor (message, type) {
    message = typeof (message) === 'string' ? message : 'A server error has preveneted your request from finishing. Please try again in a few minutes.'
    type = typeof (type) === 'string' ? type : 'api'
    super(404, message, type)
  }
}
