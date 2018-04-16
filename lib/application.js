const url = require('url')
const router = require('./router')
const {ApplicationError, RouteNotFound} = require('./errors/index')

module.exports = class Application {
  constructor (request, response) {
    this.request = request
    this.response = response
    this.requestHeaders = this.request.headers
    this.requestedPath = this.getRequestedPath()
    this.method = this.request.method.toLowerCase()
  }

  getRequestedPath () {
    let parsedUrl = url.parse(this.request.url, true)
    let path = parsedUrl.pathname
    return path.replace(/^\/+|\/+$/g, '')
  }

  checkValidRoute () {
    try {
      router[this.requestedPath](this)
    } catch (e) {
      // application error happened while requesting path
      if (e instanceof (ApplicationError)) {
        throw e
      }
      // path was not found not an application error till below
      throw new RouteNotFound()
    }
  }

  processRequest () {
    try {
      this.checkValidRoute()
    } catch (e) {
      this.handleError(e)
    }
  }

  handelError (e) {
    // check to see if error is a custom defined error or a system error
    if (e instanceof ApplicationError) {
      // check to see if the error happened in the api, gui or cli
      if (e.type === 'api') {
        this.response.writeHead(e.statusCode)
        this.response.end(e.message)
      }
      // system error handler
    } else {
      this.response.writeHead(500)
      this.response.end('A server error has prevented your request from finishing. Please try again in a few minutes.')
    }
  }
}
