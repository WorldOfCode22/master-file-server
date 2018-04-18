const typeChecker = require('../lib/type-checker')
const generalHelper = require('./helpers/general')
const FSHelpers = require('./helpers/fs-helper')

let router = {
  'api/ping': apiPing,
  'api/users': apiUserRouter,
  'api/tokens': apiTokenRouter,
  '': webHome
}

async function webHome (app) {
  try {
    let data = {}
    let template = await FSHelpers.getTemplate('index')
    let cookieObj = generalHelper.getCookieObject(app)
    let isAuth = await FSHelpers.checkTokenAndId(cookieObj)
    if (isAuth) {
      let user = await FSHelpers.getUserById(cookieObj.userId)
      if (user) data['user.authStatus'] = 'logout'
      else data['user.authStatus'] = 'login'
    } else data['user.authStatus'] = 'login'
    template = generalHelper.interpolate(template, data)
    app.response.setHeader('Content-Type', 'text/html')
    app.response.writeHead(200)
    app.response.end(template)
  } catch (e) {
    console.log(e)
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
    await FSHelpers.checkForUserTokenAndRemoveOldTokens(user.Id)
    let token = await FSHelpers.saveToken(user.Id)
    app.response.writeHead(200, {
      'Set-Cookie': ['token=' + token, 'userId=' + user.Id],
      'Content-Type': 'text/plain'
    })
    app.response.end()
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
  app.response.writeHead(200)
  app.response.end()
}
module.exports = router
