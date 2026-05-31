# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Velo Sprint is an electric vehicle configurator SPA built with React + TypeScript + Vite. Users configure a vehicle (color, wheels, optionals), place orders via Supabase, and look up order status. All UI text and domain terminology is in Brazilian Portuguese.

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server at localhost:5173
npm run build            # Production build (tsc -b && vite build)
npm run lint             # ESLint

# E2E Tests (Playwright — no npm script, use CLI directly)
npx playwright test                          # Run all tests
npx playwright test playwright/e2e/pedidos.spec.ts  # Run single test file
npx playwright test -g "test name"           # Run by test name
npx playwright test --ui                     # Interactive UI mode
npx playwright test --headed                 # See the browser
npx playwright test --debug                  # Step-through debugger
```

The dev server must be running (`npm run dev`) before executing Playwright tests — there is no `webServer` auto-start in the Playwright config.

## Architecture

**Frontend**: React 18 + Vite + SWC, styled with Tailwind CSS and shadcn/ui components.

**State**: Zustand store (`src/store/configuratorStore.ts`) persisted to localStorage. Holds vehicle configuration, orders list, and current user email.

**Backend**: Supabase (orders table). Client in `src/integrations/supabase/client.ts`, DB types auto-generated in `types.ts`.

**Routing** (React Router v6): `/` landing → `/configure` → `/order` → `/success`. Also `/lookup` for searching existing orders, plus `/termos`, `/privacidade`.

**Path alias**: `@/*` maps to `src/*` (configured in tsconfig and vite.config).

## Test Architecture

Tests live in `playwright/` using a **Feature Actions** pattern (not Page Objects):

- `playwright/e2e/*.spec.ts` — test specs
- `playwright/support/fixtures.ts` — custom `test` fixture exposing an `app` object
- `playwright/support/actions/` — factory functions that return action objects encapsulating element locators and interactions (e.g., `createOrderLockupActions()`, `createConfiguratorActions()`, `createCheckoutActions()`)
- `playwright/support/database/` — Kysely-based seeding layer (`database.ts` client/connection, `schema.ts` table types, `orderRepository.ts` thin `insertOrder`/`deleteOrderByNumber`/`deleteOrdersByEmail` functions)
- `playwright/support/fixtures/orders.json` — canonical order test data seeded by `pedidos.spec.ts`
- `playwright/support/helpers.ts` — utilities like `generateOrderCode()`

Tests import from the custom fixture: `import { test, expect } from '../support/fixtures'`

Playwright config: Chrome only, 60s test timeout, 5s assertion timeout. CI uses 2 retries with 1 worker; local runs in parallel.

## Domain Model

- **Colors**: glacier-blue, midnight-black, lunar-white
- **Wheels**: aero (default), sport (+R$ 2.000)
- **Optionals**: Precision Park (+R$ 5.500), Flux Capacitor (+R$ 5.000)
- **Base price**: R$ 40.000; financing = 12× with 2% monthly compound interest
- **Order statuses**: APROVADO, REPROVADO, EM_ANALISE
- **Order code format**: `VLO-XXXXXX` (1 digit, 1 letter, 4 alphanumeric)
