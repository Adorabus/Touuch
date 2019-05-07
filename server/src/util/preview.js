const {spawn} = require('child_process')
const ffmpeg = require('ffmpeg-static')

/*
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
*/

module.exports = {
  createPreview (ffArgs) {
    return new Promise(async (resolve, reject) => {
      try {
        const process = spawn(ffmpeg.path, ffArgs)

        process.stderr.setEncoding('utf-8')
        process.stderr.on('data', (data) => {
          console.error(data)
        })

        process.on('close', (code) => {
          if (code === 0) {
            resolve()
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
