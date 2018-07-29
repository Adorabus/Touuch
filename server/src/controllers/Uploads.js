const fs = require('mz/fs')
const path = require('path')
const blake2 = require('blake2')
const {File, Url} = require('../models')
const config = require('../config')
const {randomInt} = require('../util')

const urlChars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789'

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

function measureFile (path) {
  return new Promise(async (resolve, reject) => {
    try {
      const stats = await fs.stat(path)
      resolve(stats.size)
    } catch (error) {
      reject(new Error(`Could not find file "${path}".`))
    }
  })
}

// TODO: use a queue for race conditions, because url are sequential
function generateNextUrl () {
  return new Promise(async (resolve, reject) => {
    let urlKey = ''
    for (let i = 0; i < config.touuch.urlKeyLength; i++) {
      urlKey += urlChars[randomInt(0, urlChars.length - 1)] // TODO: Pick up here
    }

    const lastUrl = await Url.findOne({
      where: {
        deletedAt: null
      },
      order: [
        ['createdAt', 'DESC']
      ]
    })

    resolve('baka123' + Math.random())
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

      const newPath = path.join(file.destination, file.hash)
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

      if (!fileModel) {
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
  }
}
