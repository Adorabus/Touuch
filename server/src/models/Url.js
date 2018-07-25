module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define('Url', {
    filename: DataTypes.STRING,
    url: DataTypes.STRING
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
