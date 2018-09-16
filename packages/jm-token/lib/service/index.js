const Promise = require('bluebird')
const _redis = require('redis')
const crypto = require('crypto')
const event = require('jm-event')
const log = require('jm-log4js')
const error = require('jm-err')
const consts = require('../consts')
const t = require('../locale')
let Err = consts.Err
let logger = log.getLogger('token')
Promise.promisifyAll(_redis.RedisClient.prototype)
Promise.promisifyAll(_redis.Multi.prototype)

class Token extends event.EventEmitter {
  /**
   * Create a token servcie.
   * @param {Object} opts
   * @example
   * opts参数:{
   *  redis: (可选, 如果不填，自动连接默认 127.0.0.1:6379)
   *  secret: 安全密钥(可选，默认'')
   *  token_key: tokenKey, (可选, 默认'token')
   *  token_expire: token过期时间, 单位秒(可选, 默认7200秒)
   *  token_id_key: tokenIdKey, (可选, 默认'token:id')
   *  enalbe_token_id: enableTokenId, (可选, 默认 false)
   * }
   */
  constructor (opts = {}) {
    super(opts)
    this.secret = opts.secret || ''
    this.tokenKey = opts.token_key || consts.TokenKey
    this.tokenIdKey = opts.token_id_key || consts.TokenIdKey
    this.tokenExpire = opts.token_expire || consts.TokenExpire
    this.enableTokenId = opts.enable_token_id || false
    this.t = t

    let redis = null
    if (opts.redis) {
      redis = _redis.createClient(opts.redis)
    } else {
      redis = _redis.createClient()
    }
    redis.on('ready', () => {
      this.ready = true
      this.emit('ready')
    })
    redis.on('end', () => {
      this.ready = false
      this.emit('notready')
    })
    this.redis = redis
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

  /**
   * 生成token
   * @param {String} id
   * @return {String} token
   */
  generateToken (id = '') {
    id += Math.random() + Date.now().toString() + this.secret
    let sha256 = crypto.createHash('sha256')
    sha256.update(id)
    return sha256.digest('hex')
  }

  getTokenKey (id) {
    return this.tokenKey + ':' + id
  }

  getTokenIdKey (id) {
    return this.tokenIdKey + ':' + id
  }

  getExpireFromTokens (opts = {}) {
    let expire = this.tokenExpire
    for (let token in opts) {
      let o = opts[token]
      if (o.expire === 0) return 0
      if (expire < o.expire) expire = o.expire
    }
    return expire
  }

  async save (key, value, expire) {
    if (expire) {
      await this.redis.setAsync(key, value, 'EX', expire)
    } else {
      await this.redis.setAsync(key, value)
    }
  }

  async addIdToken (opts) {
    const {id, token} = opts
    let tokenMap = await this.getTokensById(id)
    token && (tokenMap[token] = opts)
    const expire = this.getExpireFromTokens(tokenMap)
    await this.save(this.getTokenIdKey(id), JSON.stringify(tokenMap), expire)
  }

  async deleteIdToken (opts) {
    const {id, token} = opts
    let tokenMap = await this.getTokensById(id)
    token && (delete tokenMap[token])
    const expire = this.getExpireFromTokens(tokenMap)
    await this.save(this.getTokenIdKey(opts.id), JSON.stringify(tokenMap), expire)
  }

  /**
   * 创建用户token, 并返回登记信息
   * @param {Object} opts
   * @example
   * opts参数:{
   *  id: id(可选)
   *  token: token(可选)
   *  expire: token过期时间, 单位秒, 0代表永不过期(可选)
   *  data: 数据(可选)
   * }
   * @param opts
   * @returns {Promise<void>}
   */
  async create (opts = {}) {
    opts.expire === undefined && (opts.expire = this.tokenExpire)
    opts.token || (opts.token = this.generateToken(opts.id))
    opts.time || (opts.time = Date.now())
    try {
      await this.save(this.getTokenKey(opts.token), JSON.stringify(opts), opts.expire)
      if (this.enableTokenId && opts.id) {
        await this.addIdToken(opts)
      }
      return opts
    } catch (e) {
      logger.error(e)
      throw error.err(Err.FA_CREATE_TOKEN)
    }
  }

  /**
   * 验证用户token, 如果成功, 返回登记信息
   * @param opts (必填)
   * @example
   * opts参数:{
   *  id: id(可选), 如果存在则比较
   *  token: token(必填)
   * }
   * @returns {Promise<*>}
   */
  async verify (opts = {}) {
    const {token, id} = opts
    if (!token) throw error.err(Err.FA_INVALID_TOKEN)
    let doc = await this.redis.getAsync(this.getTokenKey(token))
    if (!doc) throw error.err(Err.FA_INVALID_TOKEN)
    doc = JSON.parse(doc)
    if (id && doc.id !== id) throw error.err(Err.FA_VERIFY_TOKEN)
    return doc
  }

  /**
   * 延长用户token过期时间, 并返回登记信息
   * @param opts (必填)
   * @example
   * opts参数:{
   *  token: token(必填)
   *  expire: token过期时间, 单位秒(可选)
   *  data: 用户数据(可选)
   * }
   * @returns {Promise<*>}
   */
  async touch (opts = {}) {
    let {token, expire, data} = opts
    if (!token) throw error.err(Err.FA_INVALID_TOKEN)
    expire === undefined && (expire = this.tokenExpire)
    let doc = await this.verify(opts)
    doc.expire = expire
    doc.time = Date.now()
    doc.data = Object.assign({}, doc.data, data)
    try {
      await this.save(this.getTokenKey(token), JSON.stringify(doc), doc.expire)
      if (this.enableTokenId && opts.id) {
        await this.addIdToken(opts)
      }
      return doc
    } catch (e) {
      logger.error(e)
      throw error.err(Err.FA_TOUCH_TOKEN)
    }
  }

  /**
   * 删除用户token, 并返回登记信息
   * @param token
   * @returns {Promise<*>}
   */
  async delete (token) {
    if (!token) throw error.err(Err.FA_INVALID_TOKEN)
    const doc = await this.verify({token})
    try {
      await this.redis.delAsync(this.getTokenKey(token))
      if (this.enableTokenId && doc.id) {
        await this.deleteIdToken(doc)
      }
      return doc
    } catch (e) {
      logger.error(e)
      throw error.err(Err.FA_DELETE_TOKEN)
    }
  }

  async getTokensById (id) {
    if (!id) throw error.err(Err.FA_INVALID_ID)
    let doc = await this.redis.getAsync(this.getTokenIdKey(id))
    doc || (doc = '{}')
    doc = JSON.parse(doc)
    for (let token in doc) {
      let o = doc[token]
      if (o.expire === 0) continue
      let expire = o.time + o.expire * 1000
      if (expire <= Date.now()) delete doc[token]
    }
    return doc
  }

  async deleteById (id) {
    if (!id) throw error.err(Err.FA_INVALID_ID)
    try {
      let tokenMap = await this.getTokensById(id)
      let tokens = Object.keys(tokenMap)
      let promises = tokens.map((token) => this.delete(token))
      let results = await Promise.all(promises)
      await this.redis.delAsync(this.getTokenIdKey(id))
      return results
    } catch (e) {
      logger.error(e)
      throw error.err(Err.FA_DELETE_TOKEN)
    }
  }
}

module.exports = Token
