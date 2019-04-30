module.exports = (sequelize, DataTypes) => {
  const FileType = sequelize.define('FileType', {
    extension: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    mimeType: DataTypes.STRING
  }, {
    timestamps: true,
    paranoid: true
  })

  FileType.associate = function (models) {
    FileType.hasMany(models.File, {foreignKey: 'fileTypeId'})
  }

  return FileType
}
