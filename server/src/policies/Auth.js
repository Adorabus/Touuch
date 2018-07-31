const {verifyInput, schemas} = require('./VerifyInput')
const isEmpty = require('lodash/isEmpty')

module.exports = {
  login (req, res, next) {
    verifyInput(req, res, next, {
      username: schemas.username.required(),
      password: schemas.password.required(),
      twoFactorToken: schemas.twoFactorToken
    }, {
      vague: true
    })
  },
  resetPassword (req, res, next) {
    verifyInput(req, res, next, {
      password: schemas.password.required()
    })
  },
  registerUser (req, res, next) {
    verifyInput(req, res, next, {
      username: schemas.username.required(),
      password: schemas.password.required()
    })
  },
  setPassword (req, res, next) {
    verifyInput(req, res, next, {
      username: schemas.username.required(),
      password: schemas.password.required()
    })
  },
  editUser (req, res, next) {
    if (isEmpty(req.body)) {
      return res.status(400).send({
        error: 'No edits provided.'
      })
    }

    verifyInput(req, res, next, {
      username: schemas.username,
      password: schemas.password
    }, {
      allowUnknown: true
    })
  }
}
