const { argvParser } = require('../../dev/index')
// command only return true or string

// config exit

// config true
// config string

test('rollup true', () => {
  const data = argvParser({
    config: true,
  })
  expect(data.config).toEqual('')
})

test('config string', () => {
  const path = 'test'
  const data = argvParser({
    config: path,
  })
  expect(data.config).toEqual(path)
})

// config not exit
test('config string', () => {
  const data = argvParser({})
  expect(data.config).toEqual('')
})

// rollup exit
// rollup true
// rollup '' / 'path' like config

test('config string', () => {
  const data = argvParser({
    rollup: true,
  })

  expect(data.rollup).toEqual('')
})

// not is exit, rollup exit
test('config string', () => {
  const path = 'test'
  const data = argvParser({
    not: true,
    rollup: path,
  })
  expect(data.rollup).toEqual(false)
})
