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
      UploadPolicy.file,
      Uploads.uploadFile
    ],
    get: [
      LoggedIn.isLoggedIn,
      Uploads.index
    ]
  },
  '/hash': {
    post: [
      LoggedIn.isLoggedIn,
      UploadPolicy.hash,
      Uploads.uploadHash
    ]
  },
  '/:url': {
    get: [
      Uploads.view
    ],
    delete: [
      LoggedIn.isLoggedIn,
      Uploads.remove
    ]
  }
}
