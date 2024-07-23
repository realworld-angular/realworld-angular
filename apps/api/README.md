# RealWorld Angular API

This repository contains the API for the RealWorld Angular project.
The application is built with [Nitro](https://nitro.unjs.io/), a NodeJS web server framework.

## Local development setup

To run the documentation locally, you need to have [Node.js](https://nodejs.org/en) and [pnpm](https://pnpm.io/fr/) installed on your machine.

### Install dependencies

```bash
pnpm install
```

### Connect to the database

// TODO - Add instructions to connect to the database

### Generate Prisma client

The Prisma client is a type-safe database client auto-generated based on your Prisma schema.
In a nutshell, it will provide you with a type-safe API to interact with your database.
To generate the client, run:

```bash
pnpm run prisma:generate
```

To dynamically update the client when the schema changes, you can run the following command in a separate terminal:

```bash
pnpm run prisma:generate -- --watch
```

### Start the development server

```bash
pnpm dev --filter api
```

The API will be available at [http://localhost:3000](http://localhost:3000) by default. Check your terminal for the exact URL.


## Project Structure

Inside the project, you'll see the following folders and files:

```
.
├── prisma/
├── server/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   └── utils
```

The project is using [Prisma](https://www.prisma.io/) as an ORM to interact with the database. The `prisma/` directory contains the Prisma schema and migrations.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                     | Action                                       |
|:----------------------------|:---------------------------------------------|
| `pnpm install`              | Installs dependencies                        |
| `pnpm dev --filter api`     | Starts local dev server at `localhost:3000`  |
| `pnpm build --filter api`   | Build your production site to `./dist/`      |
| `pnpm preview --filter api` | Preview your build locally, before deploying |


### Specific Prisma commands

Run these commands in the `apps/api` directory:

| Command                    | Action                                |
|:---------------------------|:--------------------------------------|
| `pnpm run prisma:generate` | Updates the Prisma client with typing |
| `pnpm run prisma:migrate`  | Create a migration SQL script         |
| `pnpm run prisma:studio`   | Preview your database in a browser    |
| `pnpm run prisma:format`   | Format and validate the Prisma schema |

## Contributing specific guidelines

Before commiting your changes, follow these 2 steps:


1. Run the following command to check if your Prisma schema is correctly formatted:
```bash
pnpm run prisma:format
```

2. If you updated the Prisma schema, generate a migration SQL script:
```bash
pnpm run prisma:migrate
```


## Nitro Documentation

Check out [Nitro documentation](https://nitro.unjs.io/) and the [H3](https://h3.unjs.io/) one for the HTTP layer.
