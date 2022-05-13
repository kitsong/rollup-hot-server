// edit from 'rollup-plugin-serve'
// vite
import http from 'http'
import https from 'http'
import { resolve, join, relative } from 'path'
import { promises as fs } from 'fs'
import mime from 'mime'

type HttpsOption = {
  key: any
  cert: any
}

export interface IServerConfig {
  host: string
  port: number
  base: string
  https: HttpsOption | null
  open: boolean
  openPath: string
  headers: any
  watch: boolean
  server: boolean
  resolve: Record<string, string>
}

export class ServerConfig implements IServerConfig {
  host: string
  port: number
  base: string
  https: HttpsOption | null
  open: boolean
  openPath: string
  headers: any
  watch: boolean
  server: boolean
  resolve: Record<string, string>
  constructor(config: IServerConfig) {
    this.host = config.host || 'localhost'
    this.port = config.port || 8000
    this.base = config.base || ''
    this.https = config.https || null
    this.open = config.open || true
    this.openPath = config.openPath || ''
    this.watch = config.watch || true
    this.server = config.server || true
    this.resolve = config.resolve || {}
  }
}

type ServerType = http.Server | https.Server
type ServerResponse = http.ServerResponse | https.ServerResponse
type ServerRequest = http.ClientRequest | https.ClientRequest

export class Server {
  config: ServerConfig
  server: ServerType
  constructor(cf: ServerConfig) {
    this.config = cf
    const { https } = this.config

    this.close()
    this.server = this.createServer(https)
  }

  async listen() {
    return new Promise((resolve, reject) => {
      try {
        const { port } = this.config
        const server = this.server.listen(port, () => {
          resolve({
            async close() {
              await new Promise(resolve => {
                server.close(resolve)
              })
            },
          })
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  close() {
    if (this.server) {
      this.server.close()
    } else {
      this.closeServerOnTermination()
    }
  }

  closeServerOnTermination() {
    const terminationSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP']
    terminationSignals.forEach(signal => {
      process.on(signal, () => {
        if (this.server) {
          this.server.close()
          process.exit()
        }
      })
    })
  }

  createServer(https: HttpsOption | null): ServerType {
    const requestListener = this.requestListener.bind(this)
    return https ? require('https').createServer(https, requestListener) : require('http').createServer(requestListener)
  }

  async requestListener(request: ServerRequest, response: ServerResponse) {
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
