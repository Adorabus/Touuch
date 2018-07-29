const fs = require('mz/fs')
const blake2 = require('blake2')
const config = require('../config')
const {File, Url} = require('../models')
const {randomInt} = require('../util')
const {urlChars, urlKeyLength} = config.touuch

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

function incrementUrl (url) {
  const urlCharCount = urlChars.length
  const lastChar = url.slice(-1)

  let digitValue = 0
  for (let i = 0; i < urlCharCount; i++) {
    if (urlChars[i] === lastChar) {
      digitValue = i + 1
      break
    }
  }

  if (digitValue >= urlCharCount) {
    return incrementUrl(url.slice(0, -1)) + urlChars[0]
  } else {
    return url.slice(0, -1) + urlChars[digitValue]
  }
}

// TODO: use a queue for race conditions, because url are sequential
function generateNextUrl () {
  return new Promise(async (resolve) => {
    let urlKey = ''
    for (let i = 0; i < urlKeyLength; i++) {
      urlKey += urlChars[randomInt(0, urlChars.length - 1)]
    }

    const lastUrlModel = await Url.findOne({
      where: {
        deletedAt: null
      },
      order: [
        ['createdAt', 'DESC']
      ]
    })

    if (!lastUrlModel) {
      return resolve(urlChars[0] + urlKey)
    }

    const nextUrl = incrementUrl(lastUrlModel.url.slice(0, urlKeyLength * -1))
    resolve(nextUrl + urlKey)
  })
}

function createUrl (fileModel, user, filename) {
  return new Promise(async (resolve, reject) => {
    try {
      const urlString = await generateNextUrl()
      const url = await fileModel.createUrl({
        url: urlString,
        filename,
        ownerId: user.id
      })

      resolve(url)
    } catch (error) {
      reject(error)
    }
  })
}

function createFile (file) {
  return new Promise(async (resolve, reject) => {
    try {
      const fileModel = await File.create({
        hash: file.hash,
        size: file.size
      })

      const newPath = fileModel.getPath()
      await fs.rename(file.path, newPath)
      file.path = newPath

      resolve(fileModel)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  async uploadFile (req, res) {
    try {
      // TODO: Check if file exists
      // store the hash in the file req.file object
      req.file.hash = await hashFile(req.file.path)
      let fileModel = await File.findOne({
        where: {
          hash: req.file.hash
        }
      })

      if (fileModel) {
        await fs.unlink(req.file.path)
      } else {
        fileModel = await createFile(req.file)
      }

      const urlModel = await createUrl(fileModel, req.user, req.file.originalname)
      res.send({
        url: urlModel.url
      })
    } catch (error) {
      res.status(500).send({
        error: 'Upload failed.'
      })
    }
  },
  async uploadHash (req, res) {
    try {
      const fileModel = await File.findOne({
        where: {
          hash: req.body.hash
        }
      })

      if (fileModel) {
        const urlModel = await createUrl(fileModel, req.user, req.body.filename)
        res.send({
          url: urlModel.url
        })
      } else {
        res.status(409).send({
          message: 'Hash not found.'
        })
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({
        error: 'Hash look-up failed.'
      })
    }
  },
  async view (req, res) {
    try {
      const urlModel = await Url.findOne({
        where: {
          url: req.params.url
        },
        include: ['file']
      })

      res.sendFile(urlModel.file.getPath(), {
        headers: {
          'Content-Type': urlModel.getMimeType(),
          'Content-Disposition': `inline; filename=${urlModel.filename}`
        }
      })
    } catch (error) {
      res.status(404).send({
        error: 'Requested file does not exist.'
      })
    }
  }
}
