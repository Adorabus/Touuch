const multer = require('multer')
const config = require('../config')
const upload = multer({dest: config.touuch.filesDirectory})
const Uploads = require('../controllers/Uploads')
const UploadPolicy = require('../policies/Upload')
const LoggedIn = require('../policies/LoggedIn')

module.exports = {
  '/': {
    post: [
      LoggedIn.isLoggedIn,
      upload.single('file'),
      Uploads.uploadFile
    ]
  },
  '/hash': {
    post: [
      LoggedIn.isLoggedIn,
      Uploads.uploadHash
    ]
  },
  '/:url': {
    get: [
      Uploads.view
    ]
  }
}
