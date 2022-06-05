import http from 'http'
import https from 'http'

export interface ServerArgv {
  port: number
  base: string
  https: boolean
}

export interface CmdArgv extends ServerArgv {
  rollup: false | string
  server: boolean
  watch: boolean
}

export interface RunArgv extends CmdArgv {
  config: string
}

export interface CliArgv extends RunArgv {
  version: boolean
  help: boolean
}

export type HttpsOption = {
  key: any
  cert: any
}

export interface RunConfig {
  rollup: false | string
  watch: boolean
  server: false | Partial<ServerArgvConfig>
}

export type FileServerConfig = Partial<ServerArgvConfig>

export interface ServerArgvConfig {
  port: number
  base: string
  https: boolean // | HttpsOption
  headers: any
  resolve: Record<string, string>
}

export type ServerType = http.Server | https.Server
export type ServerResponse = http.ServerResponse | https.ServerResponse
export type ServerRequest = http.ClientRequest | https.ClientRequest
