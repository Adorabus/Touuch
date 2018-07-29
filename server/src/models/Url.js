module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define('Url', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    },
    url: {
      type: 'VARCHAR(255) CHARSET utf8_bin',
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

  return Url
}
