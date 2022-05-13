import { RunArgv } from '../cli/option'
import { getRollupConfigPath, getServerConfigPath } from './getConfigPath'
import { build } from './build'
import { watch } from 'rollup'
import { loadConfigFile } from './loadConfigFile'
import { Server, ServerConfig, IServerConfig } from './server'

export async function run(command: RunArgv) {
  const { config, server } = command
  try {
    const loadRollupConfigFile = require('rollup/loadConfigFile')
    const configFile = await getRollupConfigPath(config)
    const { options, warnings } = await loadRollupConfigFile(configFile)

    const serverFile = await getServerConfigPath(server)
    const serverFileConfig = (await loadConfigFile(serverFile)) as IServerConfig

    try {
      // build
      for (const inputOptions of options) {
        await build(inputOptions)
      }

      const serverConfig = new ServerConfig(serverFileConfig)

      // watch
      if (serverConfig.watch) {
        watch(options)
      }

      // server
      if (serverConfig.server) {
        const server = new Server(serverConfig)
        await server.listen()
      }
    } catch (err: any) {
      warnings.flush()
      throw new Error(err)
    }
  } catch (err: any) {
    throw new Error(err)
  }
}
