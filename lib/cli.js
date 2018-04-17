const readline = require('readline')
const FSHelper = require('../lib/helpers/fs-helper')
const EventEmitter = require('events')

class MyEmitter extends EventEmitter {}

const emit = new MyEmitter()

const cli = {}

cli.acceptedInputs = [
  'test',
  'count users',
  'count tokens',
  'count errors'
]
cli.init = () => {
  console.log('\x1b[34m', 'CLI active', '\x1b[0m')
  cli.rlInterface = readline.createInterface({input: process.stdin, output: process.stdout, prompt: 'File Master: '})

  cli.rlInterface.on('line', (line) => {
    if (cli.acceptedInputs.indexOf(line) > -1) emit.emit(line)
    else emit.emit('try again')
  })
  cli.rlInterface.prompt()
}

emit.on('count errors', async () => {
  let count = await FSHelper.countErrors()
  console.log(`There are ${count} errors logged`)
  cli.rlInterface.prompt()
})
emit.on('count tokens', async () => {
  let count = await FSHelper.countTokens()
  console.log(`There is ${count} tokens`)
  cli.rlInterface.prompt()
})
emit.on('count users', async () => {
  let count = await FSHelper.countUsers()
  console.log(`There is ${count} users`)
  cli.rlInterface.prompt()
})

emit.on('test', () => {
  console.log('CLI is working')
  cli.rlInterface.prompt()
})

emit.on('try again', () => {
  console.log('Command not in command list try again')
  cli.rlInterface.prompt()
})
module.exports = cli
