# Best Practices — Database Seeding in Playwright Tests

Lessons learned from implementing Kysely-based database seeding for the `pedidos.spec.ts` order lookup tests.

## Plan vs Implementation: Key Differences

### 1. File Structure — Separate concerns into a `database/` directory

**Plan proposed:** Two flat files (`db.ts`, `seedOrders.ts`) in `playwright/support/` with inline types.

**Better approach (implemented):** A `playwright/support/database/` directory with three files:
- `database.ts` — Kysely client setup and connection
- `schema.ts` — TypeScript interfaces for DB tables
- `orderRepository.ts` — thin repository functions (`insertOrder`, `deleteOrderByNumber`)

**Why:** Separating schema, connection, and operations makes each file single-purpose and easier to extend when new tables or operations are needed.

### 2. Seeding Strategy — Per-test inline seeding vs shared `beforeAll`

**Plan proposed:** Centralized seed data array in `seedOrders.ts`, inserted in `beforeAll`, cleaned up in `afterAll`.

**Better approach (implemented):** Each test calls `deleteOrderByNumber()` + `insertOrder()` inline with its own data.

**Why:**
- Each test is fully self-contained — you see the DB data right next to the assertions that depend on it.
- No race conditions with parallel workers. A shared `beforeAll` runs once per worker, so with `fullyParallel: true`, multiple workers can collide (one worker's delete removes another's inserts).
- No need for `ON CONFLICT` upsert complexity.
- Tests can be run individually without depending on a shared setup step.

### 3. Connection String Parsing — `pg` cannot handle special characters

**Problem:** The `DATABASE_URL` password contains `#` and `@` characters. Passing `connectionString` directly to `pg.Pool` fails because `pg-connection-string` uses `new URL()` internally, which interprets `#` as a fragment delimiter and `@` as a user-info separator.

**Solution:** Parse the connection string manually, splitting on the **last** `@` to separate credentials from host, and on the **first** `:` in the user-pass segment to separate user from password. Pass individual fields (`user`, `password`, `host`, `port`, `database`) to `pg.Pool`.

### 4. dotenv and Special Characters — Always quote `.env` values

**Problem:** An unquoted `DATABASE_URL` in `.env` gets truncated at `#` because dotenv treats `#` as an inline comment delimiter for unquoted values.

**Solution:** Always wrap values containing `#`, `@`, spaces, or other special characters in double quotes:
```env
# Bad — dotenv truncates at #
DATABASE_URL=postgresql://user:pass#123@host:5432/db

# Good — quotes protect the full value
DATABASE_URL="postgresql://user:pass#123@host:5432/db"
```

### 5. SSL for Supabase — Always set `rejectUnauthorized: false`

Supabase requires SSL connections. Add `ssl: { rejectUnauthorized: false }` to the `pg.Pool` config. Without this, connections fail with certificate verification errors.

### 6. ESM Compatibility — `__dirname` is not available

In ESM modules (which this project uses), `__dirname` is not defined. Options:
- `import.meta.dirname` (Node 21.2+, simplest)
- `path.dirname(fileURLToPath(import.meta.url))` (works on older Node versions)

The project uses the `fileURLToPath` approach in `playwright.config.ts`.

## Checklist for Future DB Seeding

1. Quote all `.env` values that contain special characters
2. Parse connection strings manually if passwords contain `#` or `@`
3. Add `ssl: { rejectUnauthorized: false }` for Supabase connections
4. Prefer per-test seed/teardown over shared `beforeAll` when tests run in parallel
5. Keep repository functions thin — just wrap Kysely calls, no domain logic
6. Separate schema types into their own file
