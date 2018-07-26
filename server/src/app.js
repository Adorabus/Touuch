require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const requestIP = require('request-ip')
const {sequelize, File, User} = require('./models')
const config = require('./config')
const urlCont = require('./controllers/Urls')

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

      const file = await File.create({hash: 'temp'})
      await file.update('.gitignore')

      const url = await file.createUrl({
        filename: 'becky.jpg',
        url: 'aBs26n'
      })
      url.setOwner(user)

      console.log('Done.')

      urlCont.generateNextUrl()
    } catch (error) {
      console.log(error)
    }
  })
  .catch((error) => {
    console.error(`DB Connection Failure: ${error.message}`)
    process.exit(1)
  })
