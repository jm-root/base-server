const MS = require('jm-ms-core')
let ms = new MS()

module.exports = function (service, opts = {}) {
  async function create (opts) {
    const data = Object.assign({}, opts.data, opts.params)
    return service.create(data)
  }

  async function verify (opts) {
    const data = Object.assign({}, opts.data, opts.params)
    return service.verify(data)
  }

  async function touch (opts) {
    const data = Object.assign({}, opts.data, opts.params)
    return service.touch(data)
  }

  async function del (opts) {
    const data = Object.assign({}, opts.data, opts.params)
    return service.delete(data.token)
  }

  let router = ms.router()
  router
    .add('/', 'post', create)
    .add('/:token', 'get', verify)
    .add('/:token', 'put', touch)
    .add('/:token', 'delete', del)

  return router
}
