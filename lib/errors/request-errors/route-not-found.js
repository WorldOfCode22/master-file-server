const ApplicationError = require('../application-error')

module.exports = class RouteNotFound extends ApplicationError {
  constructor (message, type) {
    message = typeof (message) === 'string' ? message : 'Requested route not found'
    type = typeof (type) === 'string' ? type : 'api'
    super(404, message, type)
  }
}
