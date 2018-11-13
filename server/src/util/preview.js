// execute:  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json FILENAME
// check for error code
// if successful, resolution is parsedJson.streams.width x parsedJson.streams.height
const fs = require('mz/fs')
const config = require('../config')
const {spawn} = require('child_process')
const ffprobe = require('ffprobe-static')
const ffmpeg = require('ffmpeg-static')
const path = require('path')
const aniGif = require('animated-gif-detector')

const maxDimension = config.touuch.previewResolution

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

function getFFArgs (inputPath, outputPath, ext) {
  return new Promise(async (resolve, reject) => {
    try {
      const dimensions = await getDimensions(inputPath)
      let newDimensions = `scale=${maxDimension}:-1`
      if (dimensions.height > dimensions.width) {
        newDimensions = `scale=-1:${maxDimension}`
      }

      let args = [
        '-v', 'error',
        '-i', inputPath
      ]

      if (!ext) {
        throw new Error('Cannot create preview for file without extension.')
      }

      let animatedGif = (ext === 'gif') && (await isAnimated(inputPath))
      if (animatedGif || extVideo.includes(ext)) {
        args.push(
          '-c:v', 'libvpx',
          '-b:v', '200K',
          '-crf', '12',
          '-ss', '0',
          '-t', '5',
          '-an', '-y',
          '-f', 'webm'
        )
      } else if (extImage.includes(ext)) {
        args.push(
          '-f', 'image2',
          '-vcodec', 'png'
        )
      } else {
        throw new Error(`Cannot create preview for file with extension: ${ext}`)
      }

      args.push('-vf', newDimensions, outputPath)

      resolve(args)
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
        const args = await getFFArgs(inputPath, outputPath, ext)

        const process = spawn(ffmpeg.path, args)

        process.stderr.setEncoding('utf-8')
        process.stderr.on('data', (data) => {
          console.error(data)
        })

        process.on('close', (code) => {
          if (code === 0) {
            resolve(outputPath)
          } else {
            reject(new Error('FFMPEG exited with non-zero exit code.'))
          }
        })
      } catch (error) {
        reject(new Error('Failed to create preview.'))
      }
    })
  },
  getFallbackPreview (fileExtension) {

  }
}
