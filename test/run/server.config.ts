export default {
  watch: true,
  rollup: true, // boolean | rollup.config.js path
  server: {
    host: 'localhost',
    port: 8000,
    base: '',
    https: true, // HttpsOption | boolean
    headers: {},
    resolve: {}, // Record<string, string>
  },
}
