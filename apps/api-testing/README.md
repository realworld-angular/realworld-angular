# RealWorld Angular API testing

This repository contains the API testing application for the RealWorld Angular project.
The application is built with [PlayWright](https://playwright.dev/docs/api-testing), a end-to-end testing solution.

## Local development setup

To run the documentation locally, you need to have [Node.js](https://nodejs.org/en) and [pnpm](https://pnpm.io/fr/) installed on your machine.

### Install dependencies

```bash
pnpm install
```

### Start the development server

Run the following command in the `apps/api-testing` directory:

```bash
pnpm run test
```

Run the following command to get a rich UI experience with wathc mode:

```bash
pnpm run test:ui
```

## Project Structure

// TODO - Add project structure

## Commands

All commands are run from the `apps/api-testing` directory , from a terminal:

| Command                  | Action                                      |
|:-------------------------|:--------------------------------------------|
| `pnpm run test`          | Run tests                                   |
| `pnpm run test:ui`       | Run tests with an UI                        |

## PLayWright Documentation

Check out [PlayWright’s docs](https://playwright.dev/docs/api-testing).
