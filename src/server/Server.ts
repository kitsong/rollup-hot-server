// idea from 'rollup-plugin-serve'

import { resolve, join, relative } from 'path'
import { promises as fs } from 'fs'
import mime from 'mime'
import { logger } from '../logger/logger'
import { getFakeCert } from './fakeCert'
import {
  ServerArgvConfig,
  FileServerConfig,
  // HttpsOption,
  ServerType,
  ServerRequest,
  ServerResponse,
} from '../types/types'

// https setting come next version
export class ServerConfig implements ServerArgvConfig {
  port: number
  base: string
  https: boolean // | HttpsOption
  headers: any
  resolve: Record<string, string>
  constructor(config: FileServerConfig) {
    this.port = (config && config.port) || 8000
    this.base = (config && config.base) || ''
    this.https = (config && config.https) || false
    this.resolve = (config && config.resolve) || {}
  }
}

export class Server {
  config: ServerConfig
  server: ServerType | null
  constructor(cf: ServerConfig) {
    this.config = cf
    this.close()
    this.server = null
  }

  private async createServer(https: boolean): Promise<ServerType> {
    try {
      const requestListener = this.requestListener.bind(this)

      if (!https) return Promise.resolve(require('http').createServer(requestListener))

      // https setting come next version
      if (typeof https !== 'boolean') return Promise.resolve(require('https').createServer(https, requestListener))

      const cert = await getFakeCert()
      const credentials = {
        key: cert,
        cert: cert,
      }
      return Promise.resolve(require('https').createServer(credentials, requestListener))
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async listen(): Promise<void> {
    try {
      const { base, port, https } = this.config
      this.server = await this.createServer(https)
      await this.addlisten(this.server, port)
      logger.stage('server')
      logger.server({
        protocol: https ? 'https' : 'http',
        base,
        port,
      })
      logger.logStatic(' ')
      return Promise.resolve()
    } catch (err) {
      return Promise.reject(err)
    }
  }

  private addlisten(server: ServerType, port: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (server) {
        server.listen(port, resolve)
      } else {
        reject()
      }
    })
  }

  close() {
    if (this.server) {
      this.server.close()
    }
  }

  private async requestListener(request: ServerRequest, response: ServerResponse) {
    const { url } = request as any
    const queryRE = /\?.*$/s
    const hashRE = /#.*$/s
    let path = url.replace(hashRE, '').replace(queryRE, '')

    // resolve base
    path = this.resolveBase(path)

    // resolve path
    path = this.resolvePath(path)

    // resolve to html
    let filePath = resolve('.' + path)
    if (path.endsWith('/')) {
      filePath = resolve(filePath, 'index.html')
    }

    try {
      const fileBuffer = await fs.readFile(filePath)
      const mineType = mime.getType(filePath) as string
      response.setHeader('Content-Type', mineType)
      response.writeHead(200)
      response.end(fileBuffer, 'utf-8')
    } catch (err) {
      response.writeHead(404)
      response.end('404 Not Found' + '\n\n' + filePath, 'utf-8')
    }
  }

  private resolvePath(path: string) {
    const { base } = this.config
    const resolveOption = this.config.resolve

    for (const key in resolveOption) {
      const target = join(base, key)
      if (path.indexOf(target) === 0) {
        const result = join(base, resolveOption[key])
        const restPath = relative(target, path)

        return resolve(result, restPath)
      }
    }

    return path
  }

  private resolveBase(path: string) {
    const { base } = this.config
    return join(base, path)
  }
}
