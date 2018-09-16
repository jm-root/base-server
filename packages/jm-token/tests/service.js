process.env.NODE_CONFIG_DIR = __dirname + '/../../../config'
const config = require('../../../config')
const $ = require('../lib')
console.log(config)
const service = $(config)
module.exports = service
