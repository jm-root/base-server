const {Schema} = require('mongoose')
const {ObjectId, Mixed} = Schema.Types

const schemaDefine = {
  level: {type: Number, default: 1},
  category: {type: String},
  userId: {type: ObjectId},
  title: {type: String},
  ip: {type: String},
  type: {type: Number},
  crtime: {type: Date, default: Date.now},
  status: {type: Number, default: 1},
  data: {type: Mixed}
}

module.exports = function (schema, opts) {
  schema = schema || new Schema()
  schema.add(schemaDefine)
  return schema
}
