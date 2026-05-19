# Pizza Marketplace — Angular Frontend

The frontend single-page application for the Pizza Marketplace, built with [Angular v21](https://angular.dev/). This is a learning and reference implementation that demonstrates modern Angular patterns — standalone components, signals, reactive forms, lazy loading, route guards, and server-sent events — within a cohesive, opinionated codebase. It is part of the [RealWorld Angular](https://github.com/realworld-angular/realworld-angular) initiative.

Customers can browse pizzerias, build their cart, place orders, and track their delivery. Pizzeria admins and kitchen staff have a dedicated admin panel to manage menus, orders, and staff.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Application Structure](#application-structure)
- [Roles and Access](#roles-and-access)
- [Contributing](#contributing)
- [License](#license)

## Overview

Key features of the frontend:

- **Browse** pizzerias and their menus without an account
- **Cart and checkout** — add pizzas with options (size, crust, toppings) and place an order
- **Order tracking** — view the real-time status of your orders
- **Authentication** — register, log in, and manage your profile
- **Staff invite flow** — accept a pizzeria invite via a token link to join as kitchen staff
- **Admin panel** — manage pizzerias, pizza menus, orders, and staff (role-gated)

> **This is a playground application for developers learning Angular and full-stack patterns.** It is not a real marketplace — no actual orders are fulfilled, no payment is processed, and mock data is encouraged.

The app communicates with the [Pizza Marketplace API](../realworld-angular-api) and proxies all `/api/*` requests to `http://localhost:3000` in development.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Angular v21](https://angular.dev/) — standalone components |
| Language | TypeScript 5.9 |
| Routing | `@angular/router` with lazy-loaded routes and guards |
| HTTP | `HttpClient` with a credentials interceptor |
| Testing | [Vitest](https://vitest.dev/) with jsdom |
| Linting | ESLint + `angular-eslint` |
| Formatting | Prettier |
| Package manager | pnpm |

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 — install with `npm install -g pnpm`
- The **Pizza Marketplace API** running on `http://localhost:3000` — see [realworld-angular-api](../realworld-angular-api)

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd realworld-angular
pnpm install
```

### 2. Make sure the API is running

The frontend proxies all API calls to `http://localhost:3000`. Start the backend before running the frontend:

```bash
# In the realworld-angular-api directory
pnpm run db:up
pnpm run db:migrate
pnpm run start:dev
```

### 3. Start the development server

```bash
pnpm start
```

The application will be available at **http://localhost:4200** and automatically reloads on file changes.

## Available Scripts

| Script | Description |
|---|---|
| `pnpm start` | Start the dev server at `http://localhost:4200` |
| `pnpm run build` | Build for production into `dist/` |
| `pnpm run watch` | Build in watch mode (development) |
| `pnpm run test` | Run unit tests with Vitest |
| `pnpm run lint` | Lint the codebase with ESLint |

## Application Structure

```
src/
├── app/                        # Root config, shell component, and route definitions
├── core/
│   ├── guards/                 # authGuard, guestGuard, roleGuard
│   ├── interceptors/           # credentialsInterceptor — attaches cookies to requests
│   ├── models/                 # TypeScript interfaces (User, Pizza, Order, etc.)
│   └── services/               # Auth, cart store, interceptors-backed HTTP, …
├── design-system/              # Global CSS reset and design tokens
├── features/
│   ├── auth/                   # Login, register, accept-invite pages
│   ├── home/                   # Homepage — browse all pizzerias
│   ├── pizzerias/              # Pizzeria detail page with menu
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout flow
│   ├── orders/                 # Order list and order detail pages
│   ├── profile/                # User profile page
│   ├── admin/                  # Admin panel (pizzerias, pizzas, staff, orders)
│   ├── not-found/              # 404 page
│   └── unauthorized/           # 403 page
└── shared/                     # Reusable UI components
```

### Route Map

| Route | Access |
|---|---|
| `/` | Public |
| `/pizzerias/:id` | Public |
| `/auth/login` | Guests only (redirected if already logged in) |
| `/auth/register` | Guests only |
| `/invite/:token` | Public |
| `/cart` | Public — build a cart without an account; checkout requires sign-in |
| `/checkout` | Authenticated |
| `/orders` | Authenticated |
| `/orders/:id` | Authenticated |
| `/profile` | Authenticated |
| `/admin/pizzerias` | `PIZZERIA_ADMIN` |
| `/admin/pizzerias/new` | `PIZZERIA_ADMIN` |
| `/admin/pizzerias/:id` | `PIZZERIA_ADMIN` — layout shell; redirects to a default tab |
| `/admin/pizzerias/:id/orders` | `PIZZERIA_ADMIN` |
| `/admin/pizzerias/:id/pizzas` | `PIZZERIA_ADMIN` |
| `/admin/pizzerias/:id/configuration` | `PIZZERIA_ADMIN` |

## Roles and Access

The application supports two user roles:

| Role | Description |
|---|---|
| `CUSTOMER` | Default role — can browse, order, and track their orders |
| `PIZZERIA_ADMIN` | Can create and manage pizzerias, menus, and orders |

Role guards (`roleGuard`) protect admin routes client-side. The API also enforces roles server-side.

## Contributing

Contributions are welcome! Please follow these guidelines:

- **Fork** the repository and create your branch from `main`
- **Write tests** for new components or services (Vitest)
- **Follow** the existing Angular conventions (standalone components, `inject()`, signals where applicable)
- **Run lint and tests** before submitting: `pnpm run lint && pnpm run test`
- Open a **pull request** with a clear description of the changes and motivation

### Reporting Issues

If you find a bug or have a feature request, please [open an issue](../../issues) with:
- A clear and descriptive title
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Browser and OS details

## License

This project is licensed under the [MIT License](LICENSE).
