const typeChecker = require('../lib/type-checker')
const FSHelpers = require('./helpers/fs-helper')

let router = {
  'api/ping': apiPing,
  'api/users': apiUserRouter,
  'api/tokens': apiTokenRouter,
  '': webHome
}

async function webHome (app) {
  try {
    let template = await FSHelpers.getTemplate('index')
    console.log(template)
    app.response.setHeader('Content-Type', 'text/html')
    app.response.writeHead(200)
    app.response.end(template)
  } catch (e) {
    app.handleError(e)
  }
}
function apiUserRouter (app) {
  switch (app.method) {
    case 'post':
      apiUsersPost(app)
  }
}

function apiTokenRouter (app) {
  switch (app.method) {
    case 'post':
      apiTokensPost(app)
  }
}
// creation of new token
async function apiTokensPost (app) {
  try {
    typeChecker.checkType(app.requestHeaders.username, 'string')
    typeChecker.checkType(app.requestHeaders.password, 'string')
    let user = await FSHelpers.checkValidUsernameAndPassword(app.requestHeaders.username, app.requestHeaders.password)
    await FSHelpers.checkForUserTokenAndRemoveOldTokens(app, user.Id)
    let token = await FSHelpers.saveToken(user.Id)
    app.response.setHeader('Content-Type', 'application/json')
    app.response.writeHead(200)
    app.response.end(JSON.stringify({token: token}))
  } catch (e) {
    app.handleError(e)
  }
}
// creation of new user
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
    app.handleError(e)
  }
}

function apiPing (app) {
  app.response.end('test')
}
module.exports = router
