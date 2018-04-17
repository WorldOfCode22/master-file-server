const url = require('url')
const router = require('./router')
const {ApplicationError, RouteNotFound} = require('./errors/index')
const FSHelpers = require('./helpers/fs-helper')

module.exports = class Application {
  constructor (request, response) {
    this.requestStart = Date.now()
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
      this.requestEnd = Date.now()
      this.requestTime = this.requestEnd - this.requestStart
    } catch (e) {
      // application error happened while requesting path
      if (e instanceof (ApplicationError)) {
        throw e
      }
      // path was not found not an application error till below
      throw new RouteNotFound()
    }
  }

  async processRequest () {
    try {
      this.checkValidRoute()
      await FSHelpers.logRequest(this)
    } catch (e) {
      this.handleError(e)
    }
  }

  async handleError (e) {
    // check to see if error is a custom defined error or a system error
    if (e instanceof ApplicationError) {
      // check to see if the error happened in the api, gui or cli
      if (e.type === 'api') {
        this.response.setHeader('Content-Type', 'application/json')
        this.response.writeHead(e.statusCode)
        this.response.end(JSON.stringify({error: e.message}))
        await FSHelpers.logRequestError(this, e)
      }
      // system error handler
    } else {
      this.response.setHeader('Content-Type', 'application/json')
      this.response.writeHead(500)
      this.response.end(JSON.stringify({error: 'A server error has prevented your request from finishing. Please try again in a few minutes.'}))
      await FSHelpers.logRequestError(this, e)
    }
  }
}
