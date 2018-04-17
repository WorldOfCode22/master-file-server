const Application = require('./lib/application')
const cli = require('./lib/cli')
const http = require('http')

function httpServerAction (req, res) {
  let app = new Application(req, res)
  app.processRequest()
}
const httpServer = http.createServer((req, res) => { httpServerAction(req, res) })

httpServer.listen(3000, () => {})

cli.init()
