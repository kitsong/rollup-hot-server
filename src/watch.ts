import { RollupWatchOptions } from 'rollup'
import rollup from 'rollup'
import { logger } from './logger/logger'
import { getDate } from './utils'
import { basename } from 'path'
export async function watch(option: RollupWatchOptions) {
  const watcher = rollup.watch(option)

  logger.stage('watch')

  watcher.on('event', event => {
    switch (event.code) {
      case 'ERROR':
        logger.logUpdate(`[${getDate()}] ERROR: ${event.error.message}`)
        break
      case 'BUNDLE_START':
        logger.logUpdate(`[${getDate()}] start compile...`)
        break
      case 'BUNDLE_END':
        logger.logUpdate(
          `[${getDate()}] SUCCESS: ${event.input} => ${event.output.map(item => basename(item)).join(', ')}`
        )
        break
    }
    logger.showUpdate()
  })
}
