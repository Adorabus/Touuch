const fs = require('mz/fs')
const path = require('path')
const blake2 = require('blake2')
const {File, Url} = require('../models')

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

// TODO: use a queue for race conditions
function generateNextUrl () {
  return new Promise(async (resolve, reject) => {
    const lastUrl = await Url.findOne({
      where: {
        deletedAt: null
      },
      order: [
        ['createdAt', 'DESC']
      ],
      include: ['file']
    })

    resolve('baka123')
  })
}

function createUrl (file, user, filename) {
  return new Promise(async (resolve, reject) => {
    try {
      const urlString = await generateNextUrl()
      const url = await file.createUrl({
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
      // store the hash in the file req.file object
      req.file.hash = await hashFile(req.file.path)
      let fileModel = await File.findOne({
        where: {
          hash: req.file.hash
        }
      })

      if (!fileModel) {
        console.log('Hash not found, creating file...')
        fileModel = await createFile(req.file)
      }

      const url = await createUrl(fileModel, req.user, req.file.originalname)
      res.send({
        url: url.url
      })
    } catch (error) {
      console.error(error)
      res.status(500).send({
        error: 'Upload failed.'
      })
    }
  }
}
