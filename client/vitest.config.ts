import { defineConfig } from 'vitest/config';

// Standalone from vite.config.ts: the game logic is pure TS, so the tests need
// neither the React/Tailwind/PWA plugins nor a DOM.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
