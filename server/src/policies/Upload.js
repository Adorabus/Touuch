const fs = require('mz/fs')
const {verifyInput, schemas} = require('./VerifyInput')

module.exports = {
  hash (req, res, next) {
    verifyInput(req, res, next, {
      hash: schemas.hash.required(),
      filename: schemas.filename.required()
    })
  },
  file (req, res, next) {
    // make sure the request included a file
    if (!req.file) {
      return res.status(400).send({
        message: 'File required.'
      })
    }

    const success = verifyInput(req, res, next, {
      originalname: schemas.filename
    }, {
      target: req.file,
      allowUnknown: true
    })

    // invalid user input, the temporary file must be deleted
    if (!success) {
      try {
        fs.unlink(req.file.path)
      } catch (error) {
        console.error('Failed to remove temporary file from failed upload.')
      }
    }
  }
}
