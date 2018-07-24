require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const requestIP = require('request-ip')
const {sequelize} = require('./models')
const config = require('./config')

const app = express()

app.use(bodyParser.json())
app.use(requestIP.mw)
app.use(express.static('public'))

require('./passport')
require('./routes')(app)

sequelize.sync()
  .then(() => {
    app.listen(config.port)
    console.log('Ready.')
  })
