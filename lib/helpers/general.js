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
module.exports = generalHelper
