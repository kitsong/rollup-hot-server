import { getConfig } from './getConfig'
import { getConfigFile } from './getConfigFile'
import { RunConfig, CmdArgv, CliArgv, FileServerConfig, ServerArgv } from '../types/types'
import { build } from '../build'
import { watch } from '../watch'
import { Server, ServerConfig } from '../server/Server'
import { logger } from '../logger/logger'

// input: command<RunArgv>
// config: '' / 'path'
// rollup: false | '' / 'path'
// server true / false
// watch true / false

export async function run(command: CliArgv) {
  logger.version()

  const BASE_SERVER_CONFIG = 'server.config'

  const cmdConfig: CmdArgv = {
    port: command.port,
    base: command.base,
    https: command.https,

    rollup: command.rollup,
    watch: command.watch,
    server: command.server,
  }

  const fileConfig = await getConfig(command.config, BASE_SERVER_CONFIG) //  as IServerConfig

  const config = mergeConfig(cmdConfig, fileConfig)

  if (config.server) {
    const serveConfig = new ServerConfig(config.server)
    const server = new Server(serveConfig)
    await server.listen()
  }

  if (config.rollup !== false) {
    const BASE_ROLLUP_CONFIG = 'rollup.config'
    const loadRollupConfigFile = require('rollup/loadConfigFile')

    const configFile = await getConfigFile(config.rollup, BASE_ROLLUP_CONFIG)
    const { options } = await loadRollupConfigFile(configFile)

    for (const inputOptions of options) {
      await build(inputOptions)
    }

    if (config.watch) {
      watch(options)
    }
  }

  logger.showUpdate()
}

// priority: cmd > file > default

export function mergeConfig(cmdConfig: CmdArgv, fileConfig: Partial<RunConfig>): RunConfig {
  const rollup = mergeRollup(cmdConfig.rollup, fileConfig.rollup)
  const watch = mergeWatch(cmdConfig.watch, fileConfig.watch)

  const serverOption: ServerArgv = {
    port: cmdConfig.port,
    base: cmdConfig.base,
    https: cmdConfig.https,
  }

  const server = mergeServer(cmdConfig.server, fileConfig.server, serverOption)
  return {
    rollup,
    watch,
    server,
  }
}

export function mergeRollup(cmdRollup: string | false, fileRollup: undefined | boolean | string) {
  let configRollup: string | false = ''

  if (cmdRollup === false) configRollup = cmdRollup

  if (typeof cmdRollup === 'string' && cmdRollup) configRollup = cmdRollup

  if (!cmdRollup) {
    if (fileRollup === false) {
      configRollup = fileRollup
    }

    if (typeof fileRollup === 'string' && fileRollup) {
      configRollup = fileRollup
    }
  }

  return configRollup
}

export function mergeWatch(cmdWatch: boolean, fileWatch: undefined | boolean) {
  if (cmdWatch === false || fileWatch === false) return false
  return true
}

export function mergeServer(
  cmdServer: boolean,
  fileServer: undefined | boolean | FileServerConfig,
  serverOption: ServerArgv
) {
  if (cmdServer === false || fileServer === false) return false

  if (typeof fileServer === 'object') {
    // deep copy, include []
    return {
      ...fileServer,
      ...serverOption,
    }
  }

  return {}
}
