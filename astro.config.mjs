import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://powergrabtx.com', // ← this is required
  integrations: [
    sitemap({
      // Keep the noindex'd thank-you page, and the blog submission form,
      // out of the sitemap Google crawls.
      filter: (page) => !page.includes('/thank-you') && !page.includes('/blog/submit'),
    }),
  ],
  build: {
    // Inline all page CSS directly into each page's <head> instead of
    // linking to an external stylesheet. For a content site where most
    // visits are a single cold-cache page load (search/social traffic),
    // this removes a render-blocking network round trip for CSS, which
    // was the main driver of the LCP "element render delay" — worth more
    // than the small amount of caching we give up across page navigations.
    inlineStylesheets: 'always',
  },
});