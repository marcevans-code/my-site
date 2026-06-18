import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://powergrabtx.com', // ← this is required
  integrations: [sitemap()],
});