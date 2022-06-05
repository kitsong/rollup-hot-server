const { run } = require('../../../dev/index')

const fileResult = {
  rollup: true,
  watch: true,
  server: {
    host: 'localhost',
    port: 3000,
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

const testRun = async () => {
  const command = {
    config: '',
    rollup: true,
    watch: true,
    server: true,
  }

  await run(command)
}

testRun()
