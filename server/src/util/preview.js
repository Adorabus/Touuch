// execute:  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json FILENAME
// check for error code
// if successful, resolution is parsedJson.streams.width x parsedJson.streams.height
const fs = require('mz/fs')
const config = require('../config')
const {spawn} = require('child_process')
const ffprobe = require('ffprobe-static')
const ffmpeg = require('ffmpeg-static')
const aniGif = require('animated-gif-detector')
const isBinaryFile = require('isbinaryfile')
const path = require('path')

const maxDimension = config.touuch.previewResolution
const resourcesDirectory = path.join(__dirname, '../../resources')
const textPreviewBackground = path.join(resourcesDirectory, 'images', 'text-bg.png')
const textFontPath = path.join(resourcesDirectory, 'fonts', 'Inconsolata-Regular.ttf')
const ffFontFile = path.relative(process.cwd(), textFontPath).replace(/\\/g, '/')

const extImage = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'psd',
  'ico',
  'tga',
  'tif',
  'tiff'
]

const extVideo = [
  'webm',
  'gif',
  'avi',
  'mp4',
  'mkv',
  'flv',
  'f4v',
  'mov',
  'wmv',
  '3gp'
]

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

function isBinary (filePath) {
  return new Promise((resolve, reject) => {
    isBinaryFile(filePath, (error, binary) => {
      if (error) {
        reject(error)
      } else {
        resolve(binary)
      }
    })
  })
}

function getFFArgs (inputPath, outputPath, ext) {
  return new Promise(async (resolve, reject) => {
    try {
      let newDimensions = 'scale=100:100:force_original_aspect_ratio=increase,crop=100:100'
      // try {
      //   const dimensions = await getDimensions(inputPath)
      //   newDimensions = `scale=${maxDimension}:-1`
      //   if (dimensions.height > dimensions.width) {
      //     newDimensions = `scale=-1:${maxDimension}`
      //   }
      // } catch (error) {
      //   newDimensions = `scale=${maxDimension}:${maxDimension}`
      // }

      // base args, always used
      let args = ['-v', 'error', '-y']
      let animated = false

      if (!ext) {
        throw new Error('Cannot create preview for file without extension.')
      }

      let animatedGif = (ext === 'gif') && (await isAnimated(inputPath))
      if (animatedGif || extVideo.includes(ext)) {
        animated = true
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
      } else if (extImage.includes(ext)) {
        args.push(
          '-i', inputPath,
          '-f', 'image2',
          '-vcodec', 'png',
          '-vf', newDimensions
        )
      } else {
        const binary = await isBinary(inputPath)
        if (binary) {
          throw new Error(`Cannot create preview for file with extension: ${ext}`)
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

      args.push(outputPath)

      resolve({args, animated})
    } catch (error) {
      reject(error)
    }
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

module.exports = {
  getDimensions,
  createPreview (inputPath, outputPath, ext) {
    return new Promise(async (resolve, reject) => {
      try {
        const {args, animated} = await getFFArgs(inputPath, outputPath, ext)

        const process = spawn(ffmpeg.path, args)

        process.stderr.setEncoding('utf-8')
        process.stderr.on('data', (data) => {
          console.error(data)
        })

        process.on('close', (code) => {
          if (code === 0) {
            resolve({outputPath, animated})
          } else {
            reject(new Error('FFMPEG exited with non-zero exit code.'))
          }
        })
      } catch (error) {
        reject(new Error('Failed to create preview.'))
      }
    })
  }
}
