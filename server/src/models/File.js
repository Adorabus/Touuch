const fs = require('mz/fs')
const blake2 = require('blake2')

function hashFile (path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.R_OK, (err) => {
      if (err) return reject(new Error(`Could not open file "${path}" for reading.`))

      const hash = blake2.createKeyedHash('blake2b', Buffer.from(process.env.FILE_HASH_KEY))
      hash.setEncoding('hex')

      const readStream = fs.createReadStream(path)

      readStream.on('end', () => {
        hash.end()
        resolve(hash.read())
      })

      readStream.pipe(hash)
    })
  })
}

function measureFile (path) {
  return new Promise(async (resolve, reject) => {
    try {
      const stats = await fs.stat(path)
      resolve(stats.size)
    } catch (error) {
      reject(new Error(`Could not find file "${path}".`))
    }
  })
}

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

  File.prototype.update = function (path) {
    return new Promise(async (resolve, reject) => {
      try {
        this.hash = await hashFile(path)
        this.size = await measureFile(path)
        await this.save()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  return File
}
