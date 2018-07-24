const {Sequelize, User, LoginAttempt} = require('../models')
const Op = Sequelize.Op
const jwt = require('jsonwebtoken')
const geoip = require('geoip-lite')
const config = require('../config/config')
const uuidv4 = require('uuid/v4')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')

function jwtSignUser (user) {
  return jwt.sign(user, config.auth.jwtSecret, {
    expiresIn: '7d'
  })
}

function sendUser (user, res) {
  const loggedInUser = user.loggedIn()
  res.send({
    user: loggedInUser,
    token: jwtSignUser(loggedInUser)
  })
}

function recordAttempt (req, success = false) {
  const ipAddress = req.clientIp
  const geo = geoip.lookup(ipAddress) || {}

  LoginAttempt.create({
    username: req.body.username,
    ipAddress,
    success,
    country: geo.country
  })
}

module.exports = {
  async login (req, res) {
    try {
      const spanStart = new Date()
      spanStart.setHours(spanStart.getHours() - config.maxFailedLoginsSpan)
      const failedLoginCount = await LoginAttempt.count({
        where: {
          ipAddress: req.clientIp,
          success: false,
          createdAt: {
            [Op.gt]: spanStart
          }
        }
      })

      if (failedLoginCount > config.maxFailedLogins) {
        return res.status(403).send({
          error: 'Try again later.'
        })
      }

      const {username, password} = req.body
      const user = await User.findOne({
        where: {
          username,
          disabledAt: null
        }
      })

      if (!user) {
        recordAttempt(req)
        return res.status(403).send({
          error: 'Invalid login.'
        })
      }

      const validPass = await user.comparePassword(password)
      if (!validPass) {
        recordAttempt(req)
        return res.status(403).send({
          error: 'Invalid login.'
        })
      }

      if (user.twoFactorSecret) {
        if (req.body.twoFactorToken) {
          // if it didn't fail, don't return early, 2FA login is success
          if (!user.verify2FA(req.body.twoFactorToken.replace(/\s+/g, ''))) {
            return res.status(403).send({
              error: 'Invalid 2FA code.'
            })
          }
        } else {
          return res.send({
            request2FA: true,
            message: 'Enter 2FA code.'
          })
        }
      }

      recordAttempt(req, true)
      sendUser(user, res)
    } catch (error) {
      res.status(500).send({
        error: 'Login error.'
      })
    }
  },
  async resetPassword (req, res) {
    try {
      const newUser = await req.user.update({
        password: req.body.password
      })

      sendUser(newUser, res)
    } catch (error) {
      res.status(500).send({
        error: 'Failed to reset password.'
      })
    }
  },
  resetUserkey (req, res) {
    try {
      req.user.update({
        userkey: uuidv4()
      })

      res.send({
        message: 'Userkey successfully reset!'
      })
    } catch (error) {
      res.status(500).send({
        error: 'Failed to reset userkey.'
      })
    }
  },
  checkAuth (req, res) {
    // check if client-side user is out of date
    if (req.query.updatedAt !== req.user.updatedAt.toISOString()) {
      // send the up-to-date user
      res.send({
        user: req.user.loggedIn()
      })
    } else {
      res.send({
        message: 'OK'
      })
    }
  },
  set2FA (req, res) {
    try {
      if (req.body.enabled) {
        const secret = speakeasy.generateSecret()
        req.user.update({
          twoFactorSecret: secret.base32
        })

        qrcode.toDataURL(secret.otpauth_url, (err, imageData) => {
          if (err) throw err
          res.send({
            message: '2FA enabled.',
            qrcode: imageData
          })
        })
      } else {
        req.user.update({
          twoFactorSecret: null
        })
        res.send({
          message: '2FA disabled.'
        })
      }
    } catch (error) {
      res.status(500).send({
        error: 'Failed to set 2FA.'
      })
    }
  }
}
