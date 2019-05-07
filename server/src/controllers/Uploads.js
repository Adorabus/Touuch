const fs = require('mz/fs')
const path = require('path')
const blake2 = require('blake2')
const config = require('../config')
const {sequelize, File, Url} = require('../models')
const {randomInt} = require('../util/math')
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
      const {hash, size} = file
      const newPath = path.join(config.storage.filesDirectory, hash)
      await fs.rename(file.path, newPath) // move the file first, so file model hooks can access it

      const fileModel = await File.create({hash, size})
      resolve(fileModel)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  async index (req, res) {
    try {
      const urls = await sequelize.query(`
        SELECT urls.filename, urls.url, urls.createdAt, files.isAnimated, files.isText
        FROM urls
        INNER JOIN files ON urls.fileId=files.id
        WHERE urls.ownerId = :ownerId
        ORDER BY urls.createdAt DESC
        LIMIT :limit
        OFFSET :offset;
      `, {
        type: sequelize.QueryTypes.SELECT,
        mapToModel: true,
        replacements: {
          ownerId: req.user.id,
          limit: parseInt(req.query.limit) || 25,
          offset: parseInt(req.query.offset) || 0,
          model: Url
        }
      })

      // convert the joined boolean columns to boolean
      for (let i = 0, len = urls.length; i < len; i++) {
        urls[i].isAnimated = !!urls[i].isAnimated
        urls[i].isText = !!urls[i].isText
      }

      res.send(urls)
    } catch (error) {
      console.error(error)
      res.status(500).send({
        error: 'Failed to index files.'
      })
    }
  },
  async uploadFile (req, res) {
    try {
      // store the hash in the file req.file object
      req.file.hash = await hashFile(req.file.path)
      let fileModel = await File.findOne({
        where: {
          hash: req.file.hash
        }
      })

      // if this file hash exists, discard the upload
      if (fileModel) {
        await fs.unlink(req.file.path)
      } else {
        fileModel = await createFile(req.file)
      }

      const urlModel = await createUrl(fileModel, req.user, req.file.originalname)
      res.status(201).send({
        url: urlModel.url
      })
    } catch (error) {
      console.error(error)
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
      // throw away extensions TODO: enforce matching type (no pranks bro)
      req.params.url = req.params.url.split('.')[0]

      const urlModel = await Url.findOne({
        where: {
          url: req.params.url
        }
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
  },
  async preview (req, res) {
    try {
      const urlModel = await Url.findOne({
        where: {
          url: req.params.url
        }
      })

      const previewPath = urlModel.file.getPreviewPath()
      if (previewPath) {
        res.sendFile(previewPath, {
          headers: {
            'Content-Type': urlModel.isAnimated ? 'video/webm' : 'image/png',
            'Content-Disposition': `inline; filename=${urlModel.url}.${urlModel.isAnimated ? 'webm' : 'png'}`
          }
        })
      } else {
        res.redirect(301, '/file.png')
      }
    } catch (error) {
      res.status(404).send({
        error: 'No preview available.'
      })
    }
  },
  async remove (req, res) {
    try {
      const urlModel = await Url.findOne({
        where: {
          url: req.params.url
        }
      })

      if (req.user.id !== urlModel.ownerId) {
        return res.status(403).send({
          error: 'You do not have permission to remove this file.'
        })
      }

      const fileModel = urlModel.file
      await urlModel.destroy()

      res.send({
        message: `Deleted ${req.params.url}.`
      })

      const remainingUrls = await fileModel.getUrls()
      if (remainingUrls.length === 0) {
        fs.unlink(fileModel.getPath())
        fileModel.destroy()
      }
    } catch (error) {
      res.status(404).send({
        error: 'Requested file does not exist.'
      })
    }
  }
}
