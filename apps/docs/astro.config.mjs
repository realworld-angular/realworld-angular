import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    integrations: [starlight({
        title: '',
        logo: {
            src: './src/assets/light-logo.svg'
        },
        social: {
            github: 'https://github.com/realworld-angular/realworld-angular'
        },
        sidebar: [{
            label: 'Guides',
            items: [
                // Each item here is one entry in the navigation menu.
                {
                    label: 'Example Guide',
                    slug: 'guides/example'
                }]
        }, {
            label: 'Reference',
            autogenerate: {
                directory: 'reference'
            }
        }, {
            label: 'Trade-offs',
            link: '/tradeoffs'
        }],
        components: {
            ThemeSelect: './src/components/ThemeSelect.astro',
            ThemeProvider: './src/components/ThemeProvider.astro'
        },
        customCss: [
            // Path to your Tailwind base styles:
            './src/styles/tailwind.css',
        ],
    }),
        tailwind({
            // Disable the default base styles:
            applyBaseStyles: false,
        }),
    ]
});
