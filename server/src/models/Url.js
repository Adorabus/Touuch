const mime = require('mime-types')
const path = require('path')
const config = require('../config')

module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define('Url', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    },
    url: {
      type: 'VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin',
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true,
    paranoid: true
  })

  Url.associate = function (models) {
    Url.belongsTo(models.User, {foreignKey: 'ownerId', as: 'owner'})
    Url.belongsTo(models.File, {foreignKey: 'fileId', as: 'file'})
    Url.addScope('defaultScope', {
      include: ['file']
    }, {
      override: true
    })
  }

  Url.prototype.getMimeType = function () {
    return mime.lookup(this.filename) || 'application/octet-stream'
  }

  return Url
}
