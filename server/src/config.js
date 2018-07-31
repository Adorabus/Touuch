const path = require('path')
const fs = require('fs')

const config = {
  port: 80,
  maxFailedLogins: 10,
  maxFailedLoginsSpan: 1, // hours
  db: {
    database: process.env.DB_NAME || 'touuch2',
    user: process.env.DB_USER || 'touuch2',
    password: process.env.DB_PASS,
    options: {
      dialect: process.env.DIALECT || 'mysql',
      host: process.env.HOST || 'localhost',
      operatorsAliases: false,
      logging: false
    }
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET
  },
  touuch: {
    urlChars: 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789',
    urlKeyLength: 4,
    filesDirectory: path.join(path.resolve(__dirname), '../../', 'uploads'),
    filesDirectoryTemp: path.join(path.resolve(__dirname), '../../', 'uploads', 'temp')
  }
}

// modules are cached, so these functions will only occur on startup
const dirExists = fs.existsSync(config.touuch.filesDirectory)
if (!dirExists) {
  fs.mkdirSync(config.touuch.filesDirectory)
}

const tempDirExists = fs.existsSync(config.touuch.filesDirectoryTemp)
if (!tempDirExists) {
  fs.mkdirSync(config.touuch.filesDirectoryTemp)
}

module.exports = config
