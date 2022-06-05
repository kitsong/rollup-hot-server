// idea from vite
import os from 'os'
import colors from 'colors'
import { version } from '../../package.json'

type ServerUrls = {
  protocol: string
  port: number
  base: string
}

enum LOG {
  STATIC = 'STATIC',
  UPDATE = 'UPDATE',
}

// not good, but easy to understand by logger.xxx
class Logger {
  logggers: Map<string, string[]>
  constructor() {
    this.logggers = new Map()
    this.logggers.set(LOG.STATIC, [])
    this.logggers.set(LOG.UPDATE, [])
  }
  logStatic(text: string) {
    const content = this.logggers.get(LOG.STATIC)
    content?.push(text)
  }
  logUpdate(text: string) {
    this.logggers.set(LOG.UPDATE, [text])
    // const content = this.logggers.get(LOG.STATIC)
    // content?.push(text)
  }
  stage(info: string) {
    this.logStatic(colors.green(`- [SUCCESS]: ${colors.bold(info)}`))
  }

  stageFail(info: string) {
    this.logStatic(colors.green(`- [SUCCESS]: ${colors.bold(info)}`))
  }

  clear() {
    this.logggers.forEach((value, key) => {
      this.logggers.set(key, [])
    })
  }

  version() {
    this.logStatic(`rollup-hot-server -v ${version}`)
    this.logStatic(' ')
  }

  server(option: ServerUrls) {
    const { protocol, port, base } = option
    Object.values(os.networkInterfaces())
      .flatMap(net => net ?? [])
      .filter(data => data && data.address && data.family === 'IPv4')
      .forEach(item => {
        this.logStatic(`> ${protocol}://${colors.green(item.address)}:${port}${base}`)
      })
  }

  showUpdate() {
    console.clear()
    this.logggers.forEach((value, key) => {
      const logs = this.logggers.get(key)
      logs?.forEach(text => {
        console.log(text)
      })
    })
  }
}

export const logger = new Logger()
