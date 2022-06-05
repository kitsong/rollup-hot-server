import { version } from '../package.json'
import { getCommandArgv } from './cli/cli'

import { run } from './run/run'

const argv = getCommandArgv()

if (argv.version) {
  console.log(`rollup-hot-server v${version}`)
} else if (argv.help) {
  console.log('rollup-hot-server help')
} else {
  run(argv)
}
