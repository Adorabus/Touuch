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

// TODO: integrate with URL model
module.exports = {
  getDimensions,
  createPreview (urlModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const filePath = urlModel.file.getPath()
        const dimensions = await getDimensions(filePath)
        const previewPath = urlModel.getPreviewPath()
        let newDimensions = `scale=${maxDimension}:-1`
        if (dimensions.height > dimensions.width) {
          newDimensions = `scale=-1:${maxDimension}`
        }

        // TODO: FILE OUTPUT FORMAT
        const process = spawn(ffmpeg.path, [
          '-loglevel', 'error',
          '-i', filePath,
          '-vf', newDimensions, previewPath
        ])

        process.stderr.setEncoding('utf-8')
        process.stderr.on('data', (data) => {
          console.error(data)
        })

        process.on('close', (code) => {
          if (code === 0) {
            resolve(previewPath)
          } else {
            reject(new Error('FFMPEG exited with non-zero exit code.'))
          }
        })
      } catch (error) {
        console.error(error)
        reject(new Error('Failed to create preview.'))
      }
    })
  },
  getPreview (urlModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const previewPath = urlModel.getPreviewPath()
        const exists = await fs.access(previewPath, fs.constants.F_OK)
        if (exists) {
          resolve(previewPath)
        } else {
          resolve(null)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}
