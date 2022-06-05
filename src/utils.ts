import { version } from 'process'

export function getDefaultFromCjs(namespace: Record<string, any>): unknown {
  return namespace.__esModule ? namespace.default : namespace
}

export function supportsNativeESM(): boolean {
  return Number(/^v(\d+)/.exec(version)![1]) >= 13
}

export function getDate() {
  const date = new Date()
  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '')
}
