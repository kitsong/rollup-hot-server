import commandParser from 'yargs-parser'
import { version } from '../../package.json'
import { commandAliases, argvParser } from './option'
import { run } from '../run/run'


export const command = commandParser(process.argv.slice(2), {
  alias: commandAliases,
  configuration: { 'camel-case-expansion': false },
})

const argv = argvParser(command)

if (argv.version) {
  console.log(`rollup-hot-server v${version}`)
} else if (argv.help) {
  console.log('rollup-hot-server help')
} else {
  run(argv)
}
