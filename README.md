# EventBook

EventBook is a React + Express + PostgreSQL event booking system with Firebase-authenticated users, admin approval flows, and Stripe Checkout.

## Architecture and operations (Phase 1)

- **Frontend** (`/frontend`): React app calling backend APIs via `REACT_APP_BACKEND_URL`.
- **Backend** (`/backend`): Express APIs, Sequelize models, Stripe checkout + webhook processing.
- **Database**: PostgreSQL (`DATABASE_URL`).
- **Payment state source of truth**: Stripe webhook updates ticket lifecycle (`pending` → `booked`/`failed`/`cancelled`).

### Required environment variables

Copy `.env.example` to `.env` and set:

- `PORT`, `NODE_ENV`
- `DATABASE_URL`
- `DB_SSL_REJECT_UNAUTHORIZED` (`true` in production unless your provider documents otherwise)
- `frontendurl` (backend success/cancel redirect origin)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Firebase Admin credentials: `PROJECT_ID`, `CLIENT_EMAIL`, `PRIVATE_KEY`, and related fields listed in `.env.example`
- Frontend `.env`: `REACT_APP_BACKEND_URL`

### Safe migration required before production deploy

Run the SQL migration in `backend/migrations/20261022_phase1_hardening.sql`:

- converts `events.price` and `tickets.price` from float to `NUMERIC(10,2)`
- prevents floating-point money storage drift

### Local development

```bash
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm start
```

### Production startup

```bash
npm ci --omit=dev
npm start
```

`npm start` uses `node backend/index.js` (not nodemon).

### Tests and build

```bash
npm test
npm run build --prefix frontend
```

### CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

- install + backend tests
- frontend production build
