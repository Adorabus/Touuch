module.exports = (sequelize, DataTypes) => {
  const LoginAttempt = sequelize.define('LoginAttempt', {
    username: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
    country: DataTypes.STRING,
    success: DataTypes.BOOLEAN
  })

  return LoginAttempt
}
