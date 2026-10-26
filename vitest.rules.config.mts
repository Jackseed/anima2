import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Tests against the emulators: security rules (`npm run test:rules`), a full game between two
// clients (`npm run test:e2e`) and a bot opponent for manual testing (`npm run bot`).
export default defineConfig({
  resolve: {
    alias: { '@anima/engine': fileURLToPath(new URL('./engine/src/index.ts', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
