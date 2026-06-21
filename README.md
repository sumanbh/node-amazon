# Node - Amazon

[![Build Status](https://github.com/sumanbh/node-amazon/actions/workflows/build.yml/badge.svg)](https://github.com/sumanbh/node-amazon/actions/workflows/build.yml)

Built with Node, and Angular 22 with server-side rendering.

Browse products, filter by specs, add to cart, checkout, and manage orders.

## Requirements

- **Node 24** or higher
- **PostgreSQL 14** or higher
- **Yarn 4** (via Corepack)

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure the app

Edit [`config/amazon.json`](config/amazon.json) to set your database credentials and optional OAuth keys:

```jsonc
{
  "postgresql": {
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "database": "node_amazon_dev",
  },
  "oauth": {
    "google": {
      "client": "YOUR_GOOGLE_CLIENT_ID",
      "secret": "YOUR_GOOGLE_SECRET",
    },
    "facebook": { "client": "YOUR_FB_APP_ID", "secret": "YOUR_FB_SECRET" },
  },
}
```

> **Note:** OAuth is optional. Local email/password auth works without it.

### 3. Initialize the database

```bash
yarn init:db
```

This creates the `node_amazon_dev` database, sets up all tables, views, and indexes, then seeds it with sample laptop data.

### 4. Start the dev server

```bash
yarn start
```

This builds the Angular app, starts the Express API on **port 3000**, and serves the Angular dev server on **port 4200** with API requests proxied to Express.

## Scripts

| Command        | Description                                           |
| -------------- | ----------------------------------------------------- |
| `yarn start`   | Build + run Express API and Angular dev server        |
| `yarn build`   | Production build                                      |
| `yarn serve`   | Serve the production build (`dist/server/server.mjs`) |
| `yarn init:db` | Create and seed the database                          |
| `yarn lint`    | Lint and auto-fix with ESLint                         |
| `yarn e2e`     | Run E2E tests using Playwright                        |

## E2E Testing

The project uses [Playwright](https://playwright.dev/) for E2E tests.

### Running Tests

To run E2E tests against the development server:

```bash
yarn e2e
```

To target a different URL (such as the production backend):

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 yarn e2e
```
