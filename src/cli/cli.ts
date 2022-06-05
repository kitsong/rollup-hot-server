import commandParser from 'yargs-parser'
import { commandAliases, argvParser } from './argv'

export function getCommandArgv() {
  const command = commandParser(process.argv.slice(2), {
    alias: commandAliases,
    configuration: { 'camel-case-expansion': false },
  })

  const argv = argvParser(command)

  return argv
}
