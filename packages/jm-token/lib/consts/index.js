let BaseErrCode = 1050
module.exports = {
  TokenKey: 'token', // 默认tokenKey
  TokenExpire: 7200, // 默认token过期时间
  TokenIdKey: 'token:id',
  Err: {
    FA_CREATE_TOKEN: {
      err: BaseErrCode + 1,
      msg: 'Create Token Fail'
    },
    FA_VERIFY_TOKEN: {
      err: BaseErrCode + 2,
      msg: 'Verify Token Fail'
    },
    FA_DELETE_TOKEN: {
      err: BaseErrCode + 3,
      msg: 'Delete Token Fail'
    },
    FA_INVALID_TOKEN: {
      err: BaseErrCode + 4,
      msg: 'Invalid Token'
    },
    FA_TOUCH_TOKEN: {
      err: BaseErrCode + 5,
      msg: 'Touch Token Fail'
    },
    FA_INVALID_ID: {
      err: BaseErrCode + 6,
      msg: 'Invalid Id'
    }
  }
}
