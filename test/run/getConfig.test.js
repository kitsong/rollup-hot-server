// should use globel jest
// run jest getConfig.test.js to test

const { getConfig } = require('../../dev/index')

const BASE_FILE_NAME = 'server.config'

const fileResult = {
  rollup: true,
  watch: true,
  server: {
    host: 'localhost',
    port: 8000,
    base: '',
    https: true,
    headers: {},
    resolve: {},
  },
}

const defultResult = {
  rollup: true,
  watch: true,
  server: true,
}

// path "", config exit
test('path "", config exit', async () => {
  const data = await getConfig('', BASE_FILE_NAME)
  expect(data).toEqual(fileResult)
})

// path "", config not exit
test('path "", config not exit', async () => {
  const data = await getConfig('', 'server.config.test')
  expect(data).toEqual(defultResult)
})

// 'path "./server.config.ts" file exit'
test('path "./server.config.ts" file exit', async () => {
  const data = await getConfig('./server.config.ts', BASE_FILE_NAME)
  expect(data).toEqual(fileResult)
})

// 'path "./server.config.ts" file not exit' with an error
test('path "./server.config.ts" file not exit', async () => {
  expect.assertions(1)
  try {
    await getConfig('./server.config.js', BASE_FILE_NAME)
  } catch (err) {
    expect(!!err).toBe(true)
  }
})
