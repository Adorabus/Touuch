const preview = require('../previews/preview')
const {Url} = require('../models')

module.exports = {
  async getDimensions () {
    try {
      const dimensions = await preview.getDimensions('C:/Users/Fox/Pictures/Wallpaper/Adorabusface.png')
      console.log(dimensions)
    } catch (error) {
      console.error(error)
    }
  },
  async createPreview () {
    try {
      const urlModel = await Url.findOne({
        where: {
          url: 'nPxFr'
        }
      })
      const previewPath = await preview.createPreview(urlModel)
      console.log(previewPath)
    } catch (error) {
      console.error(error)
    }
  }
}
