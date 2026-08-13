# PRIFYN Growth OS

PRIFYN is an AI-native Business Operating System, starting with Growth OS.

The MVP is organized around Campaign Management as the core system of record. Ads and KOL are execution channels under the same campaign lifecycle:

- **Ads Manager:** campaign setup, creative, cross-platform launch, reporting, user journey, and ROAS.
- **KOL Campaigns:** brief, KOL selection, submissions, revision/approval, publish scheduling, performance, and ROAS.

Both workflows follow the same operating rhythm:

**PLAN → EXECUTE → MEASURE → UNDERSTAND → IMPROVE → REPEAT**

MVP 1 also includes CRM Lite for lead capture and basic attribution so PRIFYN can answer:

- Which campaign generated attention?
- Which campaign generated leads?
- Which ad or creator generated qualified leads?
- Which evidence is still missing before revenue or profit conclusions?

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Google OAuth, production database, storage, and AI credentials can remain empty while running local sandbox routes. Production app routes should use real database and auth credentials.

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

Current migrations live in `drizzle/0000_*.sql` through `drizzle/0007_growth_loop_foundation.sql`. The latest migration adds the Growth OS loop foundation: lead capture events, creator interview summaries, and campaign attribution records.

Do not edit applied migration files. Change `db/schema.ts`, then generate the next migration:

```bash
npm run db:generate
```

## MVP integration policy

- Campaign lifecycle, manual imports, lead capture, attribution, and explainable recommendations come before deep OAuth automation.
- Meta, Google, and TikTok are the initial API connector targets.
- Tokopedia and Shopee retain a manual/CSV bridge until partner API access is confirmed.
- LinkedIn is represented in the KOL platform taxonomy and remains a later Ads connector.
- KOL sourcing uses the curated PRIFYN database for MVP; external sourcing providers remain future connectors.
- Platform campaigns are created in draft/paused state and require human confirmation before activation.
- Recommendations and optimizations must retain reason, evidence, confidence, limitations, and recommended action.

See [`docs/growth-os-mvp-blueprint.md`](docs/growth-os-mvp-blueprint.md) for the current product/architecture guardrails.

## Credentials to provide later

Copy `.env.example` to `.env.local` and populate the relevant values when available:

- Google OAuth client ID and secret
- PostgreSQL connection URL
- AI gateway/provider base URL, model, and API key
- Storage credentials
- Platform connector credentials as each integration is enabled
