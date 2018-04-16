module.exports = class ApplicationError extends Error {
  constructor (statusCode, message, type) {
    super(message)
    // gives error name the name of the class
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.message = message
    this.type = type
    // captures stack trace without constructor call
    Error.captureStackTrace(this, this.constructor)
  }
}
