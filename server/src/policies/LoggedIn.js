const passport = require('passport')

function checkUser (req, res, next, check) {
  return passport.authenticate('jwt', function (err, user) {
    if (err || !user) {
      res.status(403).send({
        error: 'You must log in to access this resource.'
      })
    } else {
      if (!check || check(user)) {
        req.user = user
        next()
      } else {
        res.status(403).send({
          error: 'You do not have permission to access this resource.'
        })
      }
    }
  })(req, res, next)
}

module.exports = {
  isLoggedIn (req, res, next) {
    return checkUser(req, res, next)
  },
  isAdministrator (req, res, next) {
    return checkUser(req, res, next, (user) => {
      return user.admin
    })
  }
}
