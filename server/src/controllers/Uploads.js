const fs = require('mz/fs')
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

function createFile (path) {
  return new Promise(async (resolve, reject) => {
    try {
      const hash = await hashFile(path)
      const size = await measureFile(path)
      const file = await File.create({
        hash,
        size
      })

      resolve(file)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  async uploadFile (req, res) {
    try {
      const filePath = '.gitignore' // TEMP
      const hash = await hashFile(filePath)
      let file = await File.findOne({
        where: {
          hash
        }
      })

      if (!file) {
        console.log('Hash not found, creating file...')
        file = await createFile(filePath)
      }

      const url = await createUrl(file, req.user, req.body.filename)
      res.send({
        url: url.url
      })
    } catch (error) {
      res.status(500).send({
        error: 'Upload failed.'
      })
    }
  }
}
