// should use globel jest
// run jest getConfig.test.js to test

const { mergeConfig, mergeRollup, mergeWatch, mergeServer } = require('../../dev/index')

const BASE_FILE_NAME = 'server.config'

// rollup

// config: '' / 'path'
// rollup: false | '' / 'path'
// server true / false
// watch true / false

// cmdRollup: false | '' / 'path'
// fileRollup: undefined ｜ false | true ｜ '' / 'path'

test('rollup , false, ""', async () => {
  const data = await mergeRollup(false, '')
  expect(data).toBe(false)
})

test('rollup , "path", ""', async () => {
  const data = await mergeRollup('path', '')
  expect(data).toBe('path')
})

test('rollup , "", "path" ', async () => {
  const data = await mergeRollup('', 'path')
  expect(data).toBe('path')
})

test('rollup , "", false', async () => {
  const data = await mergeRollup('', false)
  expect(data).toBe(false)
})

test('rollup , "", true', async () => {
  const data = await mergeRollup('', true)
  expect(data).toBe('')
})

test('rollup , "", undefined', async () => {
  const data = await mergeRollup('', undefined)
  expect(data).toBe('')
})

// watch
// cmdConfig.watch: false | true
// fileConfig.rollup: false ｜ true ｜ undefined

test('watch , false, true', async () => {
  const data = await mergeWatch(false, true)
  expect(data).toBe(false)
})

test('watch , true, false', async () => {
  const data = await mergeWatch(true, false)
  expect(data).toBe(false)
})

test('watch , true, undefined', async () => {
  const data = await mergeWatch(true, undefined)
  expect(data).toBe(true)
})

// server
// cmdConfig.server: false | true
// fileConfig.server: false ｜ true ｜ undefined | IServerConfig

test('server , false, any', async () => {
  const data = await mergeServer(false, true)
  expect(data).toBe(false)
})

test('server , true, false', async () => {
  const data = await mergeServer(true, false)
  expect(data).toBe(false)
})

test('server , true, undefined', async () => {
  const data = await mergeServer(true, undefined)
  expect(data).toEqual({})
})

test('server , true, true', async () => {
  const data = await mergeServer(true, true)
  expect(data).toEqual({})
})

test('server , true, []', async () => {
  const data = await mergeServer(true, [])
  expect(data).toEqual({})
})

test('server , true, { a: "2" }', async () => {
  const data = await mergeServer(true, { a: '2' })
  expect(data).toEqual({ a: '2' })
})

test('server , true, { a: "2" }, {a: "3"}', async () => {
  const data = await mergeServer(true, { a: '2' }, { a: '3' })
  expect(data).toEqual({ a: '3' })
})
