const {verifyInput, schemas} = require('./VerifyInput')

module.exports = {
  hash (req, res, next) {
    verifyInput(req, res, next, {
      hash: schemas.hash.required(),
      filename: schemas.filename.required()
    })
  },
  file (req, res, next) {
    if (!req.file) {
      return res.status(400).send({
        message: 'File required.'
      })
    }
    verifyInput(req, res, next, {
      originalname: schemas.filename
    }, {
      target: req.file,
      allowUnknown: true
    })
  }
}
