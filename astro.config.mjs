import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import alpinejs from '@astrojs/alpinejs';

// https://astro.build/config
export default defineConfig({
    integrations: [
        react(),
        tailwind({
            applyBaseStyles: false
        }),
        alpinejs({ entrypoint: '/src/astroentry.js' })
    ],
    output: 'static',
    adapter: netlify({
        imageCDN: false
    })
});
