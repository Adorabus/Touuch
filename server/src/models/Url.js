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
  }

  Url.prototype.getMimeType = function () {
    return mime.lookup(this.filename) || 'application/octet-stream'
  }

  Url.prototype.getPreviewPath = function () {
    return path.join(config.touuch.previewsDirectory, this.url)
  }

  return Url
}
