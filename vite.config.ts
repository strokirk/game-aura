import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid(), tailwindcss(), Icons({ compiler: 'solid' })],
  base: './',
  test: { environment: 'node', include: ['test/**/*.test.ts'] },
});
