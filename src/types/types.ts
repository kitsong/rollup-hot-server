export interface ServerConfig {
  host: string
  port: number
  https: {
    key: any
    cert: any
  }
  open: boolean
  openPath: string
  headers: any
  watch: boolean
  contentBase: string[]
}
