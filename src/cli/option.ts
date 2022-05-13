export interface RunArgv {
  config: string
  server: string
}

export interface CommandArgv extends RunArgv {
  version: boolean
  help: boolean
}

export const commandAliases = {
  c: 'config',
  s: 'server',
  h: 'help',
  v: 'version',
}

export function argvParser(command: Record<string, any>): CommandArgv {
  const argv = {
    config: '',
    server: '',
    version: false,
    help: false,
  }

  if (command.config && typeof command.config === 'string') {
    argv.config = command.config
  }

  if (command.server && typeof command.server === 'string') {
    argv.server = command.server
  }

  if (command.version) {
    argv.version = true
  }

  if (command.help) {
    argv.help = true
  }

  return argv
}
