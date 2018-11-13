const msm = require('jm-ms-mongoose')
const MS = require('jm-ms-core')
const ms = new MS()

module.exports = function (service, opts = {}) {
  const model = service.log

  const list = opts.list || {
    conditions: {},
    options: {
      sort: '-crtime'
    }
  }

  const router = ms.router()
  router
    .use(msm(model, {list}))

  model
    .on('before_list', opts => {
      const {search} = opts.data
      if (!search) return
      const pattern = '.*?' + decodeURIComponent(search) + '.*?'
      opts.conditions = {
        title: {$regex: pattern, $options: 'i'}
      }
    })
  return router
}
