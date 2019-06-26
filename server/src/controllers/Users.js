const {Sequelize, User, LoginAttempt} = require('../models')
const Op = Sequelize.Op
const async = require('async')

module.exports = {
  async register (req, res) {
    try {
      await User.create(req.body)
      res.send({
        message: 'User successfully created!'
      })
    } catch (error) {
      res.status(400).send({
        error: 'User already exists!'
      })
    }
  },
  async count (req, res) {
    try {
      const userCount = await User.count()
      res.send({
        userCount
      })
    } catch (error) {
      res.status(500).send({
        error: 'Failed to retrieve user count.'
      })
    }
  },
  async get (req, res) {
    try {
      let otherUser = await User.findOne({
        where: {
          username: req.params.username
        }
      })

      let lastGoodLogin = (await LoginAttempt.findAll({
        limit: 1,
        where: {
          success: true,
          username: req.params.username
        },
        order: [
          ['createdAt', 'DESC']
        ]
      }))[0]

      if (lastGoodLogin) {
        otherUser.dataValues.country = lastGoodLogin.country
      }

      res.send({
        user: otherUser.inspect()
      })
    } catch (error) {
      res.status(400).send({
        error: 'User does not exist!'
      })
    }
  },
  async index (req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10
      const search = req.query.search || ''
      const disabled = req.query.disabled === 'true'
      const order = (req.query.descending === 'true') ? 'DESC' : 'ASC'
      const orderBy = req.query.orderBy || 'id'
      let offset = parseInt(req.query.offset) || 1
      offset--
      offset *= limit

      const where = {
        username: {
          [Op.like]: `%${search}%`
        },
        disabledAt: null
      }

      // remove the restriction if desired
      if (disabled) {
        delete where.disabledAt
      }

      const result = await User.findAndCountAll({
        attributes: ['username', 'admin', 'createdAt', 'disabledAt'],
        limit,
        where,
        offset,
        order: [
          [orderBy, order]
        ]
      })

      res.send({
        users: result.rows,
        count: result.count
      })
    } catch (error) {
      res.status(500).send({
        error: 'Failed to index users.'
      })
    }
  },
  async edit (req, res) {
    try {
      const otherUser = await User.findOne({
        where: {
          username: req.params.username
        }
      })

      if (!req.user.canManage(otherUser)) {
        return res.status(403).send({
          error: 'You do not have permission to edit that user!'
        })
      }

      // prevent edits to the following
      delete req.body.id
      delete req.body.createdAt
      delete req.body.updatedAt
      delete req.body.twoFactorSecret

      // change At's back to dates
      for (let [key, value] of Object.entries(req.body)) {
        if (key.endsWith('At')) {
          req.body[key] = value ? new Date() : null
        }
      }

      otherUser.update(req.body)

      res.send({
        message: 'User edited.'
      })
    } catch (error) {
      res.status(400).send({
        error: 'User does not exist!'
      })
    }
  },
  async remove2FA (req, res) {
    try {
      const otherUser = await User.findOne({
        where: {
          username: req.params.username
        }
      })

      otherUser.update({
        twoFactorSecret: null
      })

      res.send({
        message: `2FA disabled for ${otherUser.username}.`
      })
    } catch (error) {
      res.status(400).send({
        error: 'User does not exist!'
      })
    }
  },
  getSelf (req, res) {
    try {
      res.send({
        user: req.user.loggedIn()
      })
    } catch (error) {
      res.status(500).send({
        error: 'Failed to retrieve own info.'
      })
    }
  },
  async getSelfDetails (req, res) {
    try {
      const output = {
        user: req.user.loggedIn()
      }

      await async.parallel([
        async () => {
          output.totalBytes = await req.user.getTotalBytes()
        },
        async () => {
          output.totalFiles = await req.user.getTotalFiles()
        }
      ])

      res.send(output)
    } catch (error) {
      res.status(500).send({
        error: 'Failed to retrieve own info.'
      })
    }
  }
}
