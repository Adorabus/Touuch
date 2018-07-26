const {verifyInput, schemas} = require('./VerifyInput')

module.exports = {
  file (req, res, next) {
    verifyInput(req, res, next, {
      filename: schemas.username.required()
    })
  }
}
