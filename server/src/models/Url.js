const mime = require('mime-types')
const path = require('path')
const config = require('../config')
const {createPreview} = require('../util/preview')

const resourcesDirectory = path.join(__dirname, '../../resources')
const textPreviewBackground = path.join(resourcesDirectory, 'images', 'text-bg.png')
const textFontPath = path.join(resourcesDirectory, 'fonts', 'Inconsolata-Regular.ttf')
const ffFontFile = path.relative(process.cwd(), textFontPath).replace(/\\/g, '/')

module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define('Url', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    },
    url: {
      type: 'VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin',
      allowNull: false,
      unique: true
    },
    noPreview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    hooks: {
      async beforeCreate (urlModel) {
        try {
          const ffArgs = await urlModel.getFFArgs()
          await createPreview(ffArgs)
        } catch (error) {
          urlModel.noPreview = true
        }
      }
    },
    timestamps: true,
    paranoid: true
  })

  Url.associate = function (models) {
    Url.belongsTo(models.User, {foreignKey: 'ownerId', as: 'owner'})
    Url.belongsTo(models.File, {foreignKey: 'fileId', as: 'file'})
    Url.addScope('defaultScope', {
      include: ['file']
    }, {
      override: true
    })
  }

  Url.prototype.getMimeType = function () {
    return mime.lookup(this.filename) || 'application/octet-stream'
  }

  Url.prototype.getPreviewPath = function () {
    return this.noPreview ? undefined : path.join(config.storage.previewsDirectory, this.url)
  }

  Url.prototype.getFFArgs = function () {
    return new Promise(async (resolve, reject) => {
      const fileModel = await this.getFile()
      const inputPath = fileModel.getPath()

      try {
        let newDimensions = 'scale=100:100:flags=neighbor:force_original_aspect_ratio=increase,crop=100:100'

        // base args, always used
        let args = ['-v', 'error', '-y']

        const fileModel = await this.getFile()
        if (fileModel.animated) { // an animation?
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
        } else if (fileModel.isMedia()) { // an image?
          args.push(
            '-i', inputPath,
            '-f', 'image2',
            '-vcodec', 'png',
            '-vf', newDimensions
          )
        } else {
          if (!fileModel.isText) { // binary file
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

  return Url
}
