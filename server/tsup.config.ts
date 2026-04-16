import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
})
