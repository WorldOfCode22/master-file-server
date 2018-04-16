// const { ApplicationError } = require('./errors')

const typeChecker = require('../lib/type-checker')
const FSHelpers = require('./helpers/fs-helper')

let router = {
  'api/ping': apiPing,
  'api/users': apiUserRouter
}

function apiUserRouter (app) {
  switch (app.method) {
    case 'post':
      apiUsersPost(app)
  }
}

async function apiUsersPost (app) {
  try {
    typeChecker.checkType(app.requestHeaders.username, 'string')
    typeChecker.checkType(app.requestHeaders.password, 'string')
    await FSHelpers.checkUniqueUsername(app.requestHeaders.username)
    let userObj = {}
    userObj.username = app.requestHeaders.username
    userObj.Id = FSHelpers.createRandomId()
    userObj.dateCreated = Date().toString()
    userObj.password = FSHelpers.oneWayHash(app.requestHeaders.password)
    await FSHelpers.appendUsersFile(JSON.stringify(userObj) + '\n')
    app.response.writeHead(200)
    app.response.end()
  } catch (e) {
    app.handelError(e)
  }
}

function apiPing (app) {
  app.response.end('test')
}
module.exports = router
