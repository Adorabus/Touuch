const Joi = require('joi')

const errorMessages = {
  username: 'Username must be 3 to 10 alphanumeric characters.',
  password: 'Password must be 8 to 16 characters.',
  filename: 'Invalid file name.',
  default: 'Unknown error occurred.'
}

const schemas = {
  username: Joi.string().regex(/^[A-Za-z0-9]{3,10}$/),
  password: Joi.string().regex(/^[\x20-\x7E]{8,16}$/),
  twoFactorToken: Joi.string().allow(''),
  filename: Joi().string().regex(/^[\w,\s-.]{1,255}$/)
}

function verifyInput (req, res, next, schema, descriptive = false, allowUnknown = false) {
  const {error} = Joi.validate(req.body, schema, {allowUnknown})

  if (error) {
    let errorMessage = 'Invalid input.'
    if (descriptive) {
      const errKey = error.details[0].context.key
      errorMessage = errorMessages[errKey] || errorMessages.default
    }

    res.status(400).send({
      error: errorMessage
    })
  } else {
    next()
  }
}

module.exports = {
  schemas,
  verifyInput
}
