module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define('Url', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true,
    paranoid: true
  })

  Url.associate = function (models) {
    Url.belongsTo(models.User, {foreignKey: 'owner'})
    Url.belongsTo(models.File, {foreignKey: 'file'})
  }

  return Url
}
