const jm = require('jm-dao')
const event = require('jm-event')
const _schema = require('../schema/log')

module.exports = function (service, opts = {}) {
  let schema = opts.schema || _schema()
  const {db, model_name = 'log', table_name, table_name_prefix, schemaExt} = opts

  let model = jm.dao({
    db,
    modelName: model_name,
    tableName: table_name,
    prefix: table_name_prefix,
    schema,
    schemaExt
  })
  event.enableEvent(model)

  return model
}
