const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const readline = require('readline')
const config = require('../../config')
const {CannotAppendFile, UsernameTaken, InvalidCredentials, UserAlreadyHasToken} = require('../errors')

const FSHelpers = {}

FSHelpers.usersFile = path.join(__dirname, '../../.data/.users')
FSHelpers.tokenFile = path.join(__dirname, '../../.data/.tokens')

FSHelpers.removeOldToken = (app, token) => {
  try {
    JSON.stringify(token)
    // get all of token file
    fs.readFile(FSHelpers.tokenFile, (err, file) => {
      if (err) throw new Error('Could not edit file')
      else {
        // replace token with blank
        file.replace(/token/g, '')
        // overwrite file
      }
    })
  } catch (e) {
    app.handleError(e)
  }
}

FSHelpers.checkForUserTokenAndRemoveOldTokens = (app, userId) => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({input: fs.createReadStream(FSHelpers.tokenFile)})
    rl.on('line', (line) => {
      let token = JSON.parse(line)
      if (token.expires < Date.now()) {
        FSHelpers.removeOldToken(token)
      } else if (token.userId === userId) reject(new UserAlreadyHasToken())
    })

    rl.on('close', () => {
      resolve()
    })
  })
}
FSHelpers.saveToken = (userId) => {
  let tokenObj = {
    userId,
    token: FSHelpers.createRandomId(),
    expires: Date.now() + 1000 * 60 * 12
  }
  return new Promise((resolve, reject) => {
    fs.appendFile(FSHelpers.tokenFile, JSON.stringify(tokenObj) + '\n', 'utf-8', (err) => {
      if (err) reject(new CannotAppendFile())
      else resolve(tokenObj.token)
    })
  })
}
// return value: user: obj
FSHelpers.checkValidUsernameAndPassword = (username, password) => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({input: fs.createReadStream(FSHelpers.usersFile)})
    // event on line read
    rl.on('line', (line) => {
      let user = JSON.parse(line)
      if (user.username === username && user.password === FSHelpers.oneWayHash(password)) resolve(user)
    })
    // event on EOF
    rl.on('close', () => {
      reject(new InvalidCredentials())
    })
  })
}
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
// return value: hash: string
FSHelpers.oneWayHash = (str) => {
  let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
  return hash
}
// return value: id: string
FSHelpers.createRandomId = () => {
  let options = 'aA1bBcCdD2eEfF3gGhHiI4jJkKl5LmMnNo6OpPq7QrRsStT8uUvVwWxXy9YzZ'
  let id = ''
  for (let i = 0; i < 17; i++) {
    let index = Math.floor(Math.random() * Math.floor(options.length))
    id += options[index]
  }
  return id
}
module.exports = FSHelpers
