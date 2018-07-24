const bcrypt = require('bcryptjs')
const pick = require('lodash/pick')
const omit = require('lodash/omit')
const uuidv4 = require('uuid/v4')
const speakeasy = require('speakeasy')
const config = require('../config')

function beforeSave(user, options) {
  if (!user.changed('password')) {
    return
  }

  user.setDataValue('userkey', uuidv4())

  return bcrypt
    .genSalt()
    .then((salt) => bcrypt.hash(user.password, salt))
    .then((hash) => {
      user.setDataValue('password', hash)
    })
}

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    userkey: DataTypes.STRING,
    twoFactorSecret: DataTypes.STRING,
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    disabledAt: {
      type: DataTypes.DATE,
      defaultValue: null
    }
  },
  {
    hooks: {
      beforeSave
    }
  })

  User.prototype.comparePassword = function (password) {
    return bcrypt.compareAsync(password, this.password)
  }

  User.prototype.verify2FA = function (token) {
    return speakeasy.totp.verify({
      secret: this.twoFactorSecret,
      encoding: 'base32',
      token
    })
  }

  User.prototype.loggedIn = function () {
    const userToSend = pick(this, ['username', 'userkey', 'admin', 'updatedAt'])
    userToSend.twoFactorEnabled = !!this.twoFactorSecret
    return userToSend
  }

  User.prototype.inspect = function () {
    let userToSend = this.get({ plain: true })
    userToSend.twoFactorEnabled = !!this.twoFactorSecret
    return omit(userToSend, ['password', 'userkey', 'twoFactorSecret'])
  }

  User.prototype.isRoot = function () {
    return this.id === 1
  }

  User.prototype.canManage = function (targetUser) {
    if (targetUser.isRoot()) return false
    if (this.isRoot()) return true
    return this.admin && !targetUser.admin
  }

  return User
}
