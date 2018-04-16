const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const readline = require('readline')
const config = require('../../config')
const {CannotAppendFile, UsernameTaken} = require('../errors')

const FSHelpers = {}

FSHelpers.usersFile = path.join(__dirname, '../../.data/.users')

FSHelpers.checkUniqueUsername = (username) => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({input: fs.createReadStream(FSHelpers.usersFile)})
    // event on line read
    rl.on('line', (line) => {
      if (line.length > 0) {
        let user = JSON.parse(line)
        if (user.username === username) {
          reject(new UsernameTaken())
        }
      }
    })
    // event on EOF
    rl.on('close', () => {
      resolve()
    })
  })
}
FSHelpers.appendUsersFile = (data) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(FSHelpers.usersFile, data, 'utf-8', (err) => {
      if (err) reject(new CannotAppendFile())
      else resolve()
    })
  })
}

FSHelpers.oneWayHash = (str) => {
  let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
  return hash
}
FSHelpers.createRandomId = () => {
  let options = 'aA1bBcCdD2eEfF3gGhHiI4jJkKl5LmMnNo6OpPq7QrRsStT8uUvVwWxXy9YzZ'
  let id = ''
  for (let i = 0; i < 17; i++) {
    let index = Math.floor(Math.random() * Math.floor(62))
    id += options[index]
  }
  return id
}
module.exports = FSHelpers
