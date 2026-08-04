# PRIFYN Growth OS

PRIFYN is an AI-native growth operating system for SMEs. The MVP is organized around two connected workflows:

- **One Ads Window:** campaign setup, creative, cross-platform execution, reporting, user journey, and ROAS.
- **One KOL Window:** brief, KOL selection, submissions, revision/approval, publish scheduling, performance, and ROAS.

Both workflows follow the same operating rhythm: **Input → Execution → Post**.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Google OAuth, production database, storage, and AI credentials can remain empty while using the product preview. Safe demo fallbacks are provided where appropriate.

## Validation

```bash
npm run check
```

This runs linting, TypeScript validation, the production build, rendered-route tests, AI fallback tests, authentication readiness checks, and migration safety checks.

## Database schema

The PostgreSQL schema is defined in `db/schema.ts`. Generated migrations are additive and can be applied later when `DATABASE_URL` is available:

```bash
npm run db:migrate
```

Migration order:

1. `drizzle/0000_amusing_human_fly.sql` — workspace, auth, CRM, campaign, creator, reporting, attribution, and explainable-AI foundation.
2. `drizzle/0001_large_lester.sql` — Ads Window, KOL Window, platform connection, execution reference, reporting, publishing, and KOL performance entities.

Do not edit applied migration files. Change `db/schema.ts`, then generate the next migration:

```bash
npm run db:generate
```

## MVP integration policy

- Meta, Google, and TikTok are the initial API connector targets.
- Tokopedia and Shopee retain a manual/CSV bridge until partner API access is confirmed.
- LinkedIn is represented in the KOL platform taxonomy and remains a later Ads connector.
- KOL sourcing uses the curated PRIFYN database for MVP; external sourcing providers remain future connectors.
- Platform campaigns are created in draft/paused state and require human confirmation before activation.
- Recommendations and optimizations must retain reason, evidence, confidence, limitations, and recommended action.

## Credentials to provide later

Copy `.env.example` to `.env.local` and populate the relevant values when available:

- Google OAuth client ID and secret
- PostgreSQL connection URL
- AI gateway/provider base URL, model, and API key
- Storage credentials
- Platform connector credentials as each integration is enabled
