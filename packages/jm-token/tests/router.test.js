const $ = require('./service')

let router = null
beforeAll(async () => {
  await $.onReady()
  router = $.router()
})

let create = async (opts = {id: 1}) => {
  let doc = await router.post('/tokens', {id: 1})
  return doc
}
test('version', async () => {
  let doc = await router.get('/')
  expect(doc).toBeTruthy()
})

test('create', async () => {
  let doc = await create()
  expect(doc.token).toBeTruthy()
})

test('verify', async () => {
  let doc = await create()
  const {token} = doc
  doc = await router.get(`/tokens/${token}`)
  expect(doc.token).toBeTruthy()
})

test('touch', async () => {
  let doc = await create()
  const {token} = doc
  let doc2 = await router.put(`/tokens/${token}`, {data: {name: 'jeff'}})
  expect(doc2.time > doc.time).toBeTruthy()
})

test('del', async () => {
  let doc = await create()
  const {token} = doc
  doc = await router.delete(`/tokens/${token}`)
  console.log(doc)
  expect(doc.token).toBeTruthy()
  try {
    await router.delete(`/tokens/${token}`)
  } catch (e) {
    console.log(e)
    expect(e).toBeTruthy()
  }
})
