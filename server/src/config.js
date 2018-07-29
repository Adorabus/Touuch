const path = require('path')

module.exports = {
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
    urlKeyLength: 4
  }
}
