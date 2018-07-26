const {File, Url} = require('../models')

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
        owner: user.id,
        filename
      })

      resolve(url)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  generateNextUrl
}
