const fs = require('fs')
const path = require('path')

module.exports = (app) => {
  fs
    .readdirSync(__dirname)
    .filter((file) =>
      file !== 'index.js'
    )
    .forEach((file) => {
      const route = require(path.join(__dirname, file))
      const routePath = '/' + path.basename(file, '.js')
      for (let [subpath, methods] of Object.entries(route)) {
        for (const [method, callbacks] of Object.entries(methods)) {
          if (subpath === '/') subpath = ''
          app[method](routePath + subpath, ...callbacks)
        }
      }
    })
}