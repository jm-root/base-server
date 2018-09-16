const wrapper = require('jm-ms-wrapper')
const MS = require('jm-ms-core')
const ms = new MS()
const help = require('./help')
const token = require('./token')

module.exports = function (opts = {}) {
  let service = this
  let router = ms.router()
  wrapper(service.t)(router)

  router
    .use(help(service))
    .use('/tokens', token(service))

  return router
}
