require('dotenv').config()
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

require('./passport')
require('./routes')(app)

sequelize.sync({force: true}) // TODO: Remove force
  // TODO: Remove async
  .then(async () => {
    // TEST
    try {
      await User.create({
        username: 'Baka',
        password: 'bakasaur',
        admin: true
      })

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
