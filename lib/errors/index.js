const ApplicationError = require('./application-error')
const RouteNotFound = require('./request-errors/route-not-found')
const MissingOrInvalidField = require('./request-errors/missing-or-invalid-field')
const CannotAppendFile = require('./fs-errors/cannot-append-file')
const UsernameTaken = require('./request-errors/username-taken')

module.exports.ApplicationError = ApplicationError
module.exports.RouteNotFound = RouteNotFound
module.exports.MissingOrInvalidField = MissingOrInvalidField
module.exports.CannotAppendFile = CannotAppendFile
module.exports.UsernameTaken = UsernameTaken
