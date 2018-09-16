const $ = require('./service')

let service = null
beforeAll(async () => {
  await $.onReady()
  service = $
})

test('create and verify', async () => {
  let doc = await service.create({})
  doc = await service.verify(doc)
  expect(doc.token).toBeTruthy()
})

test('create and verify by id', async () => {
  let doc = await service.create({
    id: 1
  })
  doc = await service.verify(doc)
  expect(doc.token).toBeTruthy()
})

test('touch', async () => {
  let doc = await service.create({expire: 1000})
  doc = await service.verify(doc)
  doc = await service.touch(doc)
  expect(doc.token).toBeTruthy()
})

test('delete', async () => {
  let doc = await service.create({expire: 1000})
  let token = doc.token
  doc = await service.delete(token)
  try {
    doc = await service.verify(token)
  } catch (e) {
    console.log(e)
    expect(e).toBeTruthy()
  }
})
