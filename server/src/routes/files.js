const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const Uploads = require('../controllers/Uploads')
const LoggedIn = require('../policies/LoggedIn')

module.exports = {
  '/': {
    post: [
      LoggedIn.isLoggedIn,
      upload.single('file'),
      Uploads.uploadFile
    ]
  }
}
