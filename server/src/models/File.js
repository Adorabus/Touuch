const path = require('path')
const config = require('../config')
const readChunk = require('read-chunk')
const getFileType = require('file-type')

module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    hash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    },
    size: DataTypes.BIGINT.UNSIGNED
  }, {
    hooks: {
      async beforeCreate (fileModel) {
        const buffer = await readChunk(fileModel.getPath(), 0, getFileType.minimumBytes)
        const typeInfo = await getFileType(buffer)

        const {FileType} = fileModel.sequelize.models
        const [fileType] = await FileType.findOrCreate({
          where: {
            extension: typeInfo.ext
          },
          defaults: {
            mimeType: typeInfo.mime
          }
        })

        fileModel.setFileType(fileType)
      }
    },
    timestamps: true,
    paranoid: true
  })

  File.associate = function (models) {
    File.hasMany(models.Url, {foreignKey: 'fileId'})
    File.belongsTo(models.FileType, {foreignKey: 'fileTypeId', as: 'fileType'})
  }

  File.prototype.getPath = function () {
    return path.join(config.storage.filesDirectory, this.hash)
  }

  return File
}
