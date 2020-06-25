module.exports = (sequelize, Sequelize) => {
  const LoginAttempt = sequelize.define('LoginAttempt', {
    username: Sequelize.STRING,
    ipAddress: Sequelize.STRING,
    country: Sequelize.STRING,
    success: Sequelize.BOOLEAN
  })

  return LoginAttempt
}
