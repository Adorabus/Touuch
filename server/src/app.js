require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const requestIP = require('request-ip')
const {sequelize, File, User} = require('./models')
const config = require('./config')
const uploadsController = require('./controllers/Uploads')

const app = express()

app.use(bodyParser.json())
app.use(requestIP.mw)
app.use(express.static('public'))

require('./passport')
require('./routes')(app)

sequelize.sync({force: true}) // TODO: Remove force
  .then(() => { // TODO: Remove async
    app.listen(config.port)
    console.log('Ready.')

    // TEST
    try {
      User.create({
        username: 'Baka',
        password: 'beeba'
      })
    } catch (error) {
      console.log(error)
    }
  })
  .catch((error) => {
    console.error(`DB Connection Failure: ${error.message}`)
    process.exit(1)
  })
