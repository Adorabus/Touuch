require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const requestIP = require('request-ip')
const {sequelize, File, User, Url} = require('./models')
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

    // TEST
    console.log('Adding file...')
    try {
      const user = await User.create({
        username: 'Baka'
      })

      const file = await File.create()
      await file.update('.gitignore')

      const url = file.createUrl({
        filename: 'becky.jpg',
        url: 'aBs26n',
        owner: user.id
      })

      console.log('Done.')
    } catch (error) {
      console.log(error)
    }
  })
  .catch((error) => {
    console.error(`DB Connection Failure: ${error.message}`)
    process.exit(1)
  })
