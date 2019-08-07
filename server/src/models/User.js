const bcrypt = require('bcryptjs')
const pick = require('lodash/pick')
const omit = require('lodash/omit')
const uuidv4 = require('uuid/v4')
const speakeasy = require('speakeasy')

function beforeSave (user, options) {
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

  User.associate = function (models) {
    User.hasMany(models.Url, {foreignKey: 'ownerId'})
  }

  User.prototype.comparePassword = function (password) {
    return bcrypt.compare(password, this.password)
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

  User.prototype.getTotalFiles = function () {
    return this.sequelize.models.Url.count({
      where: {
        ownerId: this.id,
        deletedAt: null
      }
    })
  }

  User.prototype.getTotalBytes = async function () {
    const result = await this.sequelize.query(`
      SELECT SUM(files.size)
      FROM files
      INNER JOIN urls ON urls.fileId=files.id
      WHERE urls.ownerId = :ownerId AND urls.deletedAt IS NULL;
    `, {
      type: sequelize.QueryTypes.SELECT,
      plain: true,
      replacements: {
        ownerId: this.id
      }
    })

    return parseInt(Object.values(result)[0])
  }

  User.prototype.isRoot = function () {
    return this.id === 1
  }

  User.prototype.canManage = function (targetUser) {
    if (this.isRoot()) return true
    if (targetUser.isRoot()) return false
    return this.admin && !targetUser.admin
  }

  return User
}
