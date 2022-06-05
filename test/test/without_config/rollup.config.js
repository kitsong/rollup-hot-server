import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import path from 'path'

export default {
  input: 'index.ts',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.es.js', format: 'esm' },
  ],
  plugins: [
    typescript({
      tsconfig: path.join(__dirname, 'tsconfig.json'),
    }),
    json(),
  ],
  onwarn({ code, message }) {
    if (code !== 'UNRESOLVED_IMPORT') {
      console.warn(message)
    }
  },
}
