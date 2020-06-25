const path = require('path')
const config = require('../config')
const {spawn} = require('child_process')
const ffprobe = require('ffprobe-static')
const {isBinaryFile} = require('isbinaryfile')
const fs = require('mz/fs')
const {createPreview, countFrames} = require('../util/preview')

const resourcesDirectory = path.join(__dirname, '../../resources')
const textPreviewBackground = path.join(resourcesDirectory, 'images', 'text-bg.png')
const textFontPath = path.join(resourcesDirectory, 'fonts', 'Inconsolata-Regular.ttf')
const ffFontFile = path.relative(process.cwd(), textFontPath).replace(/\\/g, '/')

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

module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define('File', {
    hash: {
      type: Sequelize.STRING(128),
      allowNull: false,
      unique: true
    },
    size: Sequelize.BIGINT.UNSIGNED,
    width: Sequelize.INTEGER.UNSIGNED,
    height: Sequelize.INTEGER.UNSIGNED,
    isAnimated: Sequelize.BOOLEAN,
    isText: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    noPreview: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    hooks: {
      async beforeCreate (fileModel) {
        const filePath = fileModel.getPath()
        fileModel.isText = !(await isBinaryFile(filePath))

        if (!fileModel.isText) {
          // if it's a proper media file, gather some info
          try {
            // this will throw an exception if it's not a media file
            const dimensions = await getDimensions(filePath)
            fileModel.width = dimensions.width
            fileModel.height = dimensions.height

            // so far so good, is it animated?
            const frameCount = await countFrames(filePath)
            fileModel.isAnimated = frameCount && frameCount > 1
          } catch (error) { 
            if (process.env.NODE_ENV === 'development') {
              console.error(error)
            }
          }
        }

        // generate a preview
        try {
          const ffArgs = await fileModel.getFFArgs()
          await createPreview(ffArgs)
        } catch (error) {
          fileModel.noPreview = true
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

  File.prototype.getPreviewPath = function () {
    return this.noPreview ? undefined : path.join(config.storage.previewsDirectory, this.hash)
  }

  // all media files have a width
  File.prototype.isMedia = function () {
    return !!this.width
  }

  File.prototype.getFFArgs = function () {
    return new Promise(async (resolve, reject) => {
      const inputPath = this.getPath()

      try {
        const tiny = this.width < 100 || this.height < 100
        const neighbor = tiny ? ':flags=neighbor' : ''

        let newDimensions = `scale=100:100${neighbor}:force_original_aspect_ratio=increase,crop=100:100`

        // base args, always used
        let args = ['-v', 'error', '-y']

        if (this.isAnimated) { // an animation?
          args.push(
            '-ss', '0',
            '-t', '7',
            '-i', inputPath,
            '-c:v', 'libvpx',
            '-b:v', '200K',
            '-crf', '12',
            '-an',
            '-f', 'webm',
            '-vf', newDimensions,
            '-auto-alt-ref', '0'
          )
        } else if (this.isMedia()) { // an image?
          args.push(
            '-i', inputPath,
            '-f', 'image2',
            '-vcodec', 'png',
            '-vf', newDimensions
          )
        } else {
          if (!this.isText) { // binary file
            throw new Error(`Cannot create preview for binary file.`)
          } else { // text file
            const relativeFilePath = path.relative(process.cwd(), inputPath).replace(/\\/g, '/') // ffmpeg doesn't like Windows drive letters
            const textFilter = `drawtext=textfile=${relativeFilePath}:fontcolor=#a6d627:fontfile=${ffFontFile}:fontsize=12:x=4:y=4:`

            args.push(
              '-i', textPreviewBackground,
              '-vf', textFilter,
              '-f', 'image2',
              '-vcodec', 'png'
            )
          }
        }

        args.push(this.getPreviewPath())

        resolve(args)
      } catch (error) {
        reject(error)
      }
    })
  }

  return File
}
