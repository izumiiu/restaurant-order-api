import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    env: {
      DATABASE_URI: 'mongodb://127.0.0.1:27017/test-db-not-used',
      ACCESS_TOKEN_SECRET: 'test-access-secret-not-real',
      REFRESH_TOKEN_SECRET: 'test-refresh-secret-not-real',
      ALLOWED_ORIGINS: 'http://localhost:5173',
    },
  },
});