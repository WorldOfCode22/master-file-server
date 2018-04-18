const webObjects = require('../web-objects')
let generalHelper = {}

generalHelper.interpolate = (str, data) => {
  for (let keyName in webObjects.globals) {
    if (webObjects.globals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = webObjects.globals[keyName]
    }
  }
  for (let key in data) {
    let replace = data[key]
    let find = '{' + key + '}'
    str = str.replace(find, replace)
  }
  return str
}

generalHelper.getCookieObject = (app) => {
  let list = {}
  let rc = app.request.headers.cookie

  rc && rc.split(';').forEach(cookie => {
    let parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })

  return list
}
module.exports = generalHelper
