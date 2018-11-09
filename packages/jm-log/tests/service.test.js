const $ = require('./service')

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
})

describe('service', () => {

  test('create log', async () => {
    let doc = await service.log.create({title: '淘宝'})
    expect(doc.id).toBeTruthy()
  })

})
