import { rollup, MergedRollupOptions } from 'rollup'

export async function build(inputOptions: MergedRollupOptions) {
  // create a bundle
  const outputOptions = inputOptions.output
  const bundle = await rollup(inputOptions)
  await Promise.all(outputOptions.map(bundle.write))
  await bundle.close()
}
