import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwind from "@astrojs/tailwind";
import starlightBlog from 'starlight-blog'

// https://astro.build/config
export default defineConfig({
    integrations: [starlight({
        title: 'RealWorld Angular',
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
            ThemeProvider: './src/components/ThemeProvider.astro'
        },
        customCss: [
            // Path to your Tailwind base styles:
            './src/styles/tailwind.css',
            './src/styles/shame.css',
        ],
        plugins: [starlightBlog({
            title: 'News',
            prefix: 'news'
        })]
    }),
        tailwind({
            // Disable the default base styles:
            applyBaseStyles: false,
        }),
    ]
});
