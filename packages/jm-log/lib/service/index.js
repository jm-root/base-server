const mongoose = require('mongoose')
const event = require('jm-event')
const t = require('../locale')
const log = require('./log')

class Service {
  constructor (opts = {}) {
    event.enableEvent(this)
    this.ready = false
    this.t = t

    let cb = db => {
      this.db = db
      this.log = log(this, opts)
      this.ready = true
      this.emit('ready')
    }

    const {db = 'mongodb://localhost/local'} = opts
    mongoose
      .connect(db, {useNewUrlParser: true, useCreateIndex: true})
      .then(cb)

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
