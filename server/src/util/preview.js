// execute:  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json FILENAME
// check for error code
// if successful, resolution is parsedJson.streams.width x parsedJson.streams.height
const fs = require('mz/fs')
const config = require('../config')
const {spawn} = require('child_process')
const ffprobe = require('ffprobe-static')
const ffmpeg = require('ffmpeg-static')

const maxDimension = config.touuch.previewResolution

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
  createPreview (inputPath, outputPath) {
    return new Promise(async (resolve, reject) => {
      try {
        const dimensions = await getDimensions(inputPath)

        let newDimensions = `scale=${maxDimension}:-1`
        if (dimensions.height > dimensions.width) {
          newDimensions = `scale=-1:${maxDimension}`
        }

        const process = spawn(ffmpeg.path, [
          '-loglevel', 'error',
          '-i', inputPath,
          '-f', 'image2',
          '-vcodec', 'png',
          '-vf', newDimensions, outputPath
        ])

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
  }
}
