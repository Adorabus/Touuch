const path = require('path')
const config = require('../config')
const {spawn} = require('child_process')
const ffprobe = require('ffprobe-static')
const isBinaryFile = require('isbinaryfile')
const aniGif = require('animated-gif-detector')
const fs = require('mz/fs')

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

function getDimensions (filePath) {
  return new Promise((resolve, reject) => {
    const process = spawn(ffprobe.path, [
      '-v', 'fatal',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height',
      '-of', 'json', filePath
    ])

    let processOutput = ''

    process.stdout.setEncoding('utf-8')
    process.stdout.on('data', (data) => {
      processOutput += data
    })

    process.stderr.setEncoding('utf-8')
    process.stderr.on('data', (data) => {
      console.error(data)
    })

    process.on('close', (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(processOutput)
          resolve(parsed.streams[0])
        } catch (error) {
          reject(new Error('Failed to parse JSON.'))
        }
      } else {
        reject(new Error('FFProbe exited with non-zero exit code.'))
      }
    })
  })
}

function isAnimated (filePath) {
  return new Promise((resolve, reject) => {
    try {
      let animated = false
      fs.createReadStream(filePath)
        .pipe(aniGif())
        .once('animated', () => {
          animated = true
        })
        .on('finish', () => {
          resolve(animated)
        })
    } catch (error) {
      reject(error)
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
    size: DataTypes.BIGINT.UNSIGNED,
    width: DataTypes.INTEGER.UNSIGNED,
    height: DataTypes.INTEGER.UNSIGNED,
    animated: DataTypes.BOOLEAN,
    isText: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    hooks: {
      async beforeCreate (fileModel) {
        const filePath = fileModel.getPath()
        fileModel.isText = await getIsText(filePath)

        if (!fileModel.isText) {
          // if it's a proper media file, gather some info
          try {
            // this will throw an exception if it's not a media file
            const dimensions = await getDimensions(filePath)
            fileModel.width = dimensions.width
            fileModel.height = dimensions.height

            // so far so good, is it animated?
            fileModel.animated = await isAnimated(filePath)
          } catch (error) { }
        }
      }
    },
    timestamps: true,
    paranoid: true
  })

  File.associate = function (models) {
    File.hasMany(models.Url, {foreignKey: 'fileId'})
  }

  File.prototype.getPath = function () {
    return path.join(config.storage.filesDirectory, this.hash)
  }

  // all media files have a width
  File.prototype.isMedia = function () {
    return !!this.width
  }

  return File
}
