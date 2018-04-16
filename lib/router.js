const typeChecker = require('../lib/type-checker')

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

function apiUsersPost (app) {
  console.log(app.requestHeaders)
  typeChecker.checkType(app.requestHeaders.username, 'string')
  typeChecker.checkType(app.requestHeaders.password, 'string')
}

function apiPing (app) {
  app.response.end('test')
}
module.exports = router
