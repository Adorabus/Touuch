const passport = require('passport')
const {User} = require('./models')
const config = require('./config')
const passportJwt = require('passport-jwt')

const JwtStrategy = passportJwt.Strategy
const ExtractJwt = passportJwt.ExtractJwt

passport.use(
  new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.auth.jwtSecret
  },
  async function (jwtPayload, done) {
    try {
      const user = await User.findOne({
        where: {
          username: jwtPayload.username,
          userkey: jwtPayload.userkey,
          disabledAt: null
        }
      })
      if (!user) {
        return done(new Error(), false)
      }
      return done(null, user)
    } catch (error) {
      return done(new Error(), false)
    }
  })
)

module.exports = null
