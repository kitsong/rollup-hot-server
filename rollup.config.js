import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import path from 'path'

const env = process.env.npm_lifecycle_event
let input, output, plugins

if (env === 'dev') {
  input = 'src/index.dev.ts'
  output = 'dev/index.js'
  plugins = []
} else if (env === 'build') {
  input = 'src/index.ts'
  output = 'dist/index.js'
  plugins = [terser()]
} else {
  throw new Error('Not Match Env')
}

export default {
  input,
  output: [{ file: output, format: 'cjs' }],
  plugins: [
    typescript({
      tsconfig: path.join(__dirname, 'tsconfig.json'),
    }),
    json(),
    ...plugins,
  ],
  onwarn({ code, message }) {
    if (code !== 'UNRESOLVED_IMPORT') {
      console.warn(message)
    }
  },
}
