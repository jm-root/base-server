# jm-token

Token系统

## 配置参数

基本配置 请参考 [jm-server] (https://github.com/jm-root/ms/tree/master/packages/jm-server)

redis [] redis服务器Uri

secret [''] 密钥

token_key ['token'] Redis数据库主键

token_expire [7200] Token 过期时间, 单位秒(可选, 默认7200秒)

token_id_key ['token:id'] token_id Redis数据库主键

enable_token_id [false] 是否支持ID, 为true时, 支持查询及删除指定id的所有token
