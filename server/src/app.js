require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const requestIP = require('request-ip')
const {sequelize, File} = require('./models')
const config = require('./config')

const app = express()

app.use(bodyParser.json())
app.use(requestIP.mw)
app.use(express.static('public'))

require('./passport')
require('./routes')(app)

sequelize.sync({force: true}) // TODO: Remove force
  .then(async () => { // TODO: Remove async
    app.listen(config.port)
    console.log('Ready.')

    console.log('Adding file...')
    try {
      const f = await File.create()
      await f.update('.gitignore')
      console.log('Done.')
    } catch (error) {
      console.log(error)
    }
  })
