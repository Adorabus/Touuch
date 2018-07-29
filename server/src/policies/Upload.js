const {verifyInput, schemas} = require('./VerifyInput')

module.exports = {
  hash (req, res, next) {
    verifyInput(req, res, next, {
      hash: schemas.hash.required()
    })
  }
}

// check file name on uploads
