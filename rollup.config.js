import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import path from 'path'

export default {
  input: 'src/index.ts',
  output: [{ file: 'dist/index.js', format: 'cjs' }],
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
