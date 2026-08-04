# PRIFYN setup

## 1. Environment

Copy `.env.example` to `.env.local` and replace placeholders. Never commit `.env.local`.

## 2. PostgreSQL / Supabase

Use the Supabase pooled PostgreSQL connection string for `DATABASE_URL`. Generate SQL without connecting:

```bash
npm run db:generate
```

Inspect the generated file under `drizzle/`, then apply it to a development database:

```bash
npm run db:migrate
```

The schema includes Better Auth, workspace and organization tenancy, CRM, creators, campaigns, deliverables, performance facts, attribution, explainable AI evidence, action decisions, outbox events, and audit events. Commerce, finance, and workforce tables are intentionally absent.

## 3. Google OAuth

Create a Web OAuth client in Google Cloud. Add these redirect URIs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://YOUR_DOMAIN/api/auth/callback/google`

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Better Auth remains in a safe unconfigured state until the database, secret, and both Google values exist.

## 4. Better Auth secret

Generate a cryptographically random value of at least 32 characters and set `BETTER_AUTH_SECRET`. Set `BETTER_AUTH_URL` to the canonical application origin and list allowed origins in `BETTER_AUTH_TRUSTED_ORIGINS` separated by commas.

## 5. SumoPod AI

The AI boundary uses an OpenAI-compatible `POST /chat/completions` request. Configure:

- `SUMOPOD_BASE_URL=https://ai.sumopod.com/v1`
- `SUMOPOD_API_KEY`
- `SUMOPOD_MODEL` using the exact model ID shown in your SumoPod account

Without a key or model, `/api/ai/insights` intentionally returns a labelled demo response so product flows remain reviewable. Live output is schema-validated and cannot mutate business records.

## 6. Run

```bash
npm install
npm run dev
```

Before shipping, run `npm run check`.
