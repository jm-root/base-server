module.exports = {
  modules: {
    token: {
      config: {
        redis: 'token_redis',
        secret: 'token_secret',
        token_key: 'token_key',
        token_id_key: 'token_id_key',
        token_expire: 'token_expire'
      }
    },
    log: {
      config: {
        db: 'log_db',
        table_name_prefix: 'log_table_name_prefix'
      }
    }
  }
}
