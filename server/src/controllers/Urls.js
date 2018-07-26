const {File, Url} = require('../models')

function generateNextUrl () {
  return 'baka123'
}

function createUrl (file, user, filename) {
  return new Promise(async (resolve, reject) => {
    try {
      const urlString = generateNextUrl()
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

}
