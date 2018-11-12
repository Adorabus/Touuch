const path = require('path')
const config = require('../config')

module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    hash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    },
    size: DataTypes.BIGINT.UNSIGNED
  }, {
    timestamps: true,
    paranoid: true
  })

  File.associate = function (models) {
    File.hasMany(models.Url, {foreignKey: 'fileId'})
  }

  File.prototype.getPath = function () {
    return path.join(config.storage.filesDirectory, this.hash)
  }

  return File
}
