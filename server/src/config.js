const path = require('path')
const fs = require('fs')

const storageDirectory = process.env.STORAGE_DIR || path.join(path.resolve(__dirname), '../storage')
const filesDirectory = path.join(storageDirectory, 'uploads')
const filesDirectoryTemp = path.join(storageDirectory, 'temp')
const previewsDirectory = path.join(storageDirectory, 'previews')

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
    previewResolution: 100
  },
  storage: {storageDirectory, filesDirectory, filesDirectoryTemp, previewsDirectory}
}

// modules are cached, so this will only occur on startup
Object.values(config.storage).forEach((dir) => {
  const dirExists = fs.existsSync(dir)
  if (!dirExists) {
    fs.mkdirSync(dir)
  }
})

module.exports = config
