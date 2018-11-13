const mongoose = require('mongoose')
const _schema = require('../schema/log')

module.exports = function (service, opts = {}) {
  const {db = mongoose} = service
  const {modelName = 'log', tableNamePrefix = '', schema = _schema()} = opts
  if (tableNamePrefix) {
    const tableName = `${tableNamePrefix}${modelName}`
    return db.model(modelName, schema, tableName)
  } else {
    return db.model(modelName, schema)
  }
}
