// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kentrendersystems.co.uk',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/locations') && !page.includes('/rendering-maidenstone'),
    }),
  ],
});
