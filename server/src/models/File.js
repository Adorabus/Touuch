const path = require('path')
const config = require('../config')
const readChunk = require('read-chunk')
const getFileType = require('file-type')
const isBinaryFile = require('isbinaryfile')

function getIsText (filePath) {
  return new Promise((resolve, reject) => {
    isBinaryFile(filePath, (error, binary) => {
      if (error) {
        reject(error)
      } else {
        resolve(!binary)
      }
    })
  })
}

module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    hash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    },
    size: DataTypes.BIGINT.UNSIGNED,
    isText: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    hooks: {
      async beforeCreate (fileModel) {
        const filePath = fileModel.getPath()
        const isText = await getIsText(filePath)
        let typeInfo

        if (isText) {
          fileModel.isText = true
          typeInfo = {
            ext: null,
            mimeType: 'text/plain'
          }
        } else {
          const buffer = await readChunk(filePath, 0, getFileType.minimumBytes)
          typeInfo = await getFileType(buffer) || {
            ext: null,
            mimeType: 'application/octet-stream'
          }
        }

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
    File.addScope('defaultScope', {
      include: ['fileType']
    }, {
      override: true
    })
  }

  File.prototype.getPath = function () {
    return path.join(config.storage.filesDirectory, this.hash)
  }

  return File
}
