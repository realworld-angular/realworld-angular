# RealWorld Angular

RealWorld Angular is a collection of example applications built using Angular, one of the most popular front-end frameworks. The project is designed to showcase various Angular libraries and demonstrate technical aspects and best practices in Angular development. By offering real-world scenarios and complex app structures, RealWorld Angular aims to bridge the gap between simplistic tutorial projects and the challenges developers face in real-world applications.

find a complete introduction [here](https://github.com/realworld-angular).

## What's inside this repository?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a documentation website built with [StarLight](https://starlight.astro.build/)
- `api`: a Nitro application to serve the demo template API
- `api-testing`: a PLaywright application to automate the testing of the API
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```

## Contributing

This repository is using Turbo monorepo and includes the following applications. Each application has its own README file with more details and specific instructions to run them locally and contribute:

- [apps/docs](apps/old-docs/README.md): The documentation website
- [apps/api](./apps/api/README.md): The API server
- [app/api-testing](./apps/api-testing/README.md): The API testing suite

> The frontend application is in a [dedicated repository](https://github.com/realworld-angular/realworld-angular-template) as exposed as a template.

## Licenses

- News (apps/docs/src/content/docs/news): [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
- Code: Apache 2.0
