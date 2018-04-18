const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const readline = require('readline')
const config = require('../../config')
const {CannotAppendFile, UsernameTaken, InvalidCredentials, UserAlreadyHasToken} = require('../errors')

const FSHelpers = {}

FSHelpers.usersFile = path.join(__dirname, '../../.data/.users')
FSHelpers.tokenFile = path.join(__dirname, '../../.data/.tokens')
FSHelpers.requestLogFile = path.join(__dirname, '../../.logs/.request-logs')
FSHelpers.errorLogFile = path.join(__dirname, '../../.logs/.error-logs')

FSHelpers.logRequest = (app) => {
  let logObj = {
    requestedPath: app.requestedPath,
    method: app.method,
    requestTime: app.requestTime
  }
  return new Promise((resolve, reject) => {
    fs.appendFile(FSHelpers.requestLogFile, JSON.stringify(logObj) + '\n', (err) => {
      if (err) reject(new CannotAppendFile())
      else resolve()
    })
  })
}

FSHelpers.logRequestError = (app, error) => {
  let logObj = {
    requestedPath: app.requestedPath,
    method: app.method,
    error
  }
  return new Promise((resolve, reject) => {
    fs.appendFile(FSHelpers.errorLogFile, JSON.stringify(logObj) + '\n', (err) => {
      if (err) reject(new CannotAppendFile())
      else resolve()
    })
  })
}

FSHelpers.countErrors = () => {
  return new Promise((resolve) => {
    let i = 0
    const rl = readline.createInterface({input: fs.createReadStream(FSHelpers.errorLogFile)})

    rl.on('line', (line) => {
      i++
    })

    rl.on('close', () => {
      resolve(i)
    })
  })
}

FSHelpers.countTokens = () => {
  return new Promise((resolve) => {
    let i = 0
    const rl = readline.createInterface({input: fs.createReadStream(FSHelpers.tokenFile)})

    rl.on('line', (line) => {
      i++
    })

    rl.on('close', () => {
      resolve(i)
    })
  })
}

FSHelpers.countUsers = () => {
  return new Promise((resolve) => {
    let i = 0
    const rl = readline.createInterface({input: fs.createReadStream(FSHelpers.usersFile)})

    rl.on('line', (line) => {
      i++
    })

    rl.on('close', () => {
      resolve(i)
    })
  })
}

// this works however it does require reading the entire token file into memory in production that could be a large task
FSHelpers.removeOldTokens = async (tokens) => {
  let file = await new Promise((resolve, reject) => {
    fs.readFile(FSHelpers.tokenFile, (err, file) => {
      if (err) reject(new Error('Could not read file'))
      else resolve(file)
    })
  })
  for (let i = 0; i < tokens.length; i++) {
    // if file is not string convert it come out of read file as a buffer
    if (typeof (file) !== 'string') file = file.toString()
    // get the index of the token to remove then adjust for each token removed so far
    file = file.split('\n').slice(tokens[i] - i).join('\n')
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(FSHelpers.tokenFile, file, 'utf-8', (err) => {
      if (err) reject(new Error('Could not write file'))
      else resolve()
    })
  })
}

FSHelpers.checkForUserTokenAndRemoveOldTokens = (userId) => {
  return new Promise((resolve, reject) => {
    let lineTracker = 0
    let oldTokenLines = []
    const rl = readline.createInterface({input: fs.createReadStream(FSHelpers.tokenFile)})
    rl.on('line', (line) => {
      lineTracker++
      let token = JSON.parse(line)
      if (token.expires < Date.now()) {
        oldTokenLines.push(lineTracker)
      } else if (token.userId === userId) reject(new UserAlreadyHasToken())
    })

    rl.on('close', () => {
      FSHelpers.removeOldTokens(oldTokenLines)
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
