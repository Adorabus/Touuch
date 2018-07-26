const AuthController = require('../controllers/Auth')
const LoggedInPolicy = require('../policies/LoggedIn')
const AuthPolicy = require('../policies/Auth')

module.exports = {
  '/': {
    post: [
      AuthPolicy.login,
      AuthController.login
    ],
    get: [
      LoggedInPolicy.isLoggedIn,
      AuthController.checkAuth
    ]
  },
  '/password': {
    post: [
      LoggedInPolicy.isLoggedIn,
      AuthPolicy.resetPassword,
      AuthController.resetPassword
    ]
  },
  '/userkey': {
    post: [
      LoggedInPolicy.isLoggedIn,
      AuthController.resetUserkey
    ]
  },
  '/2fa': {
    post: [
      LoggedInPolicy.isLoggedIn,
      AuthController.set2FA
    ]
  }
}
