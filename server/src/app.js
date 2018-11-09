require('dotenv').config()
require('./check-environment')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const requestIP = require('request-ip')
const {sequelize, User} = require('./models')
const config = require('./config')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

app.use(cors())
app.use(morgan('combined'))
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(requestIP.mw())
app.use(function (error, req, res, next) { // eslint-disable-line no-unused-vars
  if (error) {
    console.error(error)
    try {
      res.status(error.statusCode).send({
        error: http.STATUS_CODES[error.statusCode]
      })
    } catch (error) {
      res.status(error.statusCode || 500).send({
        error: error.message
      })
    }
  }
})

require('./passport')
require('./routes')(app)

const RESET_DB = false

sequelize.sync({force: RESET_DB}) // TODO: Remove force
  // TODO: Remove async
  .then(async () => {
    // TEST
    try {
      if (RESET_DB) {
        await User.create({
          username: 'Baka',
          password: 'bakasaur',
          admin: true
        })
      }

      await app.listen(config.port)
      console.log(`Ready on port ${config.port}.`)
    } catch (error) {
      console.log(error)
    }
  })
  .catch((error) => {
    console.error(`DB Connection Failure: ${error.message}`)
    process.exit(1)
  })
