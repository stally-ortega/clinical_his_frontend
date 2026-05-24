import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  plugins: [
    {
      name: 'fix-angular-include-paths',
      config(config) {
        const include = config.test?.include;
        if (include && Array.isArray(include)) {
          const root = config.root || process.cwd();
          config.test.include = include.map((p: string) => {
            if (path.isAbsolute(p)) {
              const rel = path.relative(root, p);
              if (!rel.startsWith('..')) {
                return rel.replace(/\\/g, '/');
              }
            }
            return p;
          });
        }
        return config;
      },
    },
  ],
});
