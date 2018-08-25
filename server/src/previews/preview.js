// execute:  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json FILENAME
// check for error code
// if successful, resolution is parsedJson.streams.width x parsedJson.streams.height
const fs = require('mz/fs')
const {exec} = require('child_process')
const shellescape = require('shell-escape')
const config = require('../config')

const maxDimension = config.touuch.previewResolution

function getDimensions (filePath) {
  return new Promise((resolve, reject) => {
    const escaped = shellescape([
      'ffprobe', '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height',
      '-of', 'json', filePath
    ])

    exec(escaped, (err, stdout, stderr) => {
      if (err) {
        reject(new Error('FFProbe exited with non-zero exit code.'))
      }

      try {
        const parsed = JSON.parse(stdout)
        resolve(parsed.streams[0])
      } catch (error) {
        reject(new Error('Failed to parse JSON.'))
      }
    })
  })
}
// TODO: integrate with URL model
module.exports = {
  createPreview (urlModel) {
    return new Promise(async (resolve, reject) => {
      try {
        const dimensions = await getDimensions()
        let newDimensions = `scale=${maxDimension}:-1`
        if (dimensions.height > dimensions.width) {
          newDimensions = `scale=-1:${maxDimension}`
        }

        const escaped = shellescape([
          'ffmpeg', '-i', urlModel.file.getPath(),
          '-vf', newDimensions, urlModel.getPreviewPath()
        ])
      } catch (error) {
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
