import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://powergrabtx.com', // ← this is required
  integrations: [
    sitemap({
      // Keep the noindex'd thank-you page, and the blog submission form,
      // out of the sitemap Google crawls.
      filter: (page) => !page.includes('/thank-you') && !page.includes('/blog/submit'),
      // Morning Briefing URLs already encode their real publish date
      // (morning-briefing-YYYY-MM-DD), so we can give Google an accurate
      // <lastmod> for those without guessing. Everything else is left
      // alone rather than stamped with a fake date.
      serialize(item) {
        const match = item.url.match(/\/briefings\/morning-briefing-(\d{4}-\d{2}-\d{2})\/?$/);
        if (match) {
          return { ...item, lastmod: new Date(`${match[1]}T00:00:00Z`).toISOString() };
        }
        return item;
      },
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