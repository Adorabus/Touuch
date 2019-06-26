const AuthPolicy = require('../policies/Auth')
const LoggedIn = require('../policies/LoggedIn')
const UsersController = require('../controllers/Users')

module.exports = {
  '/': {
    post: [
      LoggedIn.isAdministrator,
      AuthPolicy.registerUser,
      UsersController.register
    ],
    get: [
      LoggedIn.isAdministrator,
      UsersController.index
    ]
  },
  '/me': {
    get: [
      LoggedIn.isLoggedIn,
      UsersController.getSelf
    ]
  },
  '/me/details': {
    get: [
      LoggedIn.isLoggedIn,
      UsersController.getSelfDetails
    ]
  },
  '/:username': {
    get: [
      LoggedIn.isAdministrator,
      UsersController.get
    ],
    put: [
      LoggedIn.isAdministrator,
      AuthPolicy.editUser,
      UsersController.edit
    ]
  },
  '/:username/remove_2fa': {
    put: [
      LoggedIn.isAdministrator,
      UsersController.remove2FA
    ]
  }
}
