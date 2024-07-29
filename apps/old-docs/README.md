# RealWorld Angular documentation

This repository contains the documentation for the RealWorld Angular project.
The application is built with [StarLight](https://starlight.astro.build/), a documentation template for Astro.

## Local development setup

To run the documentation locally, you need to have [Node.js](https://nodejs.org/en) and [pnpm](https://pnpm.io/fr/) installed on your machine.

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev --filter docs
```

The documentation will be available at [http://localhost:4321](http://localhost:4321) by default. Check your terminal for the exact URL.


## Project Structure

Inside the project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   ├── docs/
│   │   └── config.ts
│   └── env.d.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.

Static assets, like favicons, can be placed in the `public/` directory.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                      | Action                                           |
|:-----------------------------| :----------------------------------------------- |
| `pnpm install`               | Installs dependencies                            |
| `pnpm dev --filter docs`     | Starts local dev server at `localhost:4321`      |
| `pnpm build --filter docs`   | Build your production site to `./dist/`          |
| `pnpm preview --filter docs` | Preview your build locally, before deploying     |

## StarLight Documentation

Check out [Starlight’s docs](https://starlight.astro.build/), read [the Astro documentation](https://docs.astro.build), or jump into the [Astro Discord server](https://astro.build/chat).
