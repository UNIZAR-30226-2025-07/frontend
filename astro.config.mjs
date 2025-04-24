import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  devToolbar: {
    enabled: false, // Disable the dev toolbar in development mode
  },
  trailingSlash: 'ignore',
  vite: {
    server: {
      allowedHosts: ['galaxy.t2dc.es'],
    },
  },
});

