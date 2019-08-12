// TODO: Make it work for GET and requests where data is not in req.body

const Joi = require('joi')

const errorMessages = {
  username: 'Username must be 3 to 10 alphanumeric characters.',
  password: 'Password must be 8 to 16 characters.',
  filename: 'Invalid file name.',
  originalname: 'Invalid file name.',
  hash: 'Invalid hash.',
  fileLimit: 'Invalid file display limit. (positive integers only)',
  fileOffset: 'Invalid file display offset. (positive integers only)',
  default: 'Bad input.'
}

const schemas = {
  username: Joi.string().regex(/^[A-Za-z0-9]{3,10}$/),
  password: Joi.string().regex(/^[\x20-\x7E]{8,16}$/),
  twoFactorToken: Joi.string().allow(''),
  filename: Joi.string().regex(/^[\w,\s-.]{1,255}$/),
  hash: Joi.string().hex(),
  fileLimit: Joi.number().min(1).max(500).integer(),
  fileOffset: Joi.number().positive().integer()
}

function verifyInput (req, res, next, schema, options = {}) {
  try {
    const target = options.target || req.body
    const {error} = Joi.validate(target, schema, {
      allowUnknown: options.allowUnknown
    })

    if (error) {
      let errorMessage = 'Invalid input.'
      if (!options.vague) {
        const errKey = error.details[0].context.key
        errorMessage = errorMessages[errKey] || errorMessages.default
      }

      res.status(400).send({
        error: errorMessage
      })

      return false
    } else {
      next()
      return true
    }
  } catch (error) {
    res.status(500).send({
      error: 'Input validation error.'
    })
  }
}

module.exports = {
  schemas,
  verifyInput
}
