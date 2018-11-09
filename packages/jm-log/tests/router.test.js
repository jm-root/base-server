const $ = require('./service')

let router = null
let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
  router = $.router()
})

describe('router', () => {

  test('list', async () => {
    doc = await router.get('/logs', {rows: 2})
    console.log(doc)
    expect(doc.page).toBeTruthy()
  })

})
