const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const config = require('../../config')
const {CannotAppendFile} = require('./errors/')

const FSHelpers = {}

FSHelpers.usersFile = path.join(__dirname, '../../.data/.users')

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
