const jm = require('jm-dao')
const event = require('jm-event')
const t = require('../locale')
const log = require('./log')

class Service {
  constructor (opts = {}) {
    event.enableEvent(this)
    this.ready = false
    this.t = t

    let cb = db => {
      opts.db = db
      this.db = db
      this.log = log(this, opts)
      this.ready = true
      this.emit('ready')
    }

    const db = opts.db
    if (!db) {
      jm.db.connect().then(cb)
    } else if (typeof db === 'string') {
      jm.db.connect(db).then(cb)
    }

    this.onReady()
  }

  onReady () {
    let self = this
    return new Promise(function (resolve, reject) {
      if (self.ready) return resolve(self.ready)
      self.once('ready', function () {
        resolve(self.ready)
      })
    })
  }
}

module.exports = Service
