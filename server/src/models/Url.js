const mime = require('mime-types')
const path = require('path')
const config = require('../config')
const {createPreview} = require('../util/preview')

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
    },
    noPreview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    hooks: {
      async beforeCreate (urlModel) {
        try {
          const fileModel = await urlModel.getFile()
          await createPreview(fileModel.getPath(), urlModel.getPreviewPath())
        } catch (error) {
          urlModel.noPreview = true
        }
      }
    },
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

  Url.prototype.getPreviewPath = function () {
    return this.noPreview || path.join(config.storage.previewsDirectory, this.url)
  }

  return Url
}
