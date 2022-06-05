import { CliArgv } from '../types/types'
export const commandAliases = {
  c: 'config',

  n: 'not',

  r: 'rollup',
  w: 'watch',
  s: 'server',

  h: 'help',
  v: 'version',
}

export function argvParser(command: Record<string, any>): CliArgv {
  const argv: CliArgv = {
    config: '',
    rollup: '',
    server: true,
    watch: true,

    port: -1,
    base: '',
    https: false,

    version: false,
    help: false,
  }

  console.log('command', command)

  if (typeof command.config === 'string') {
    argv.config = command.config
  }

  if (typeof command.rollup === 'string') {
    argv.rollup = command.rollup
  }

  if (command.not && command.rollup) {
    argv.rollup = false
  }

  if (command.not && command.watch) {
    argv.watch = false
  }

  if (command.not && command.server) {
    argv.server = false
  }

  if (typeof command.port === 'number' && command.port > 0) {
    argv.port = command.port
  }

  if (command.base) {
    argv.base = command.base
  }

  if (command.version) {
    argv.version = true
  }

  if (command.help) {
    argv.help = true
  }

  return argv
}
