const multer = require('multer')
const upload = multer({dest: 'uploads/'})
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
  }
}
