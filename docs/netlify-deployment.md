# Netlify deployment

PRIFYN keeps its existing Vinext build for Cloudflare/Sites and provides a separate native Next.js build for Netlify.

## Build settings

Netlify reads these settings from `netlify.toml`:

- Build command: `npm run build:netlify`
- Publish directory: `.next`
- Node.js: `22.13.0`

The default `npm run build` script is also Netlify-aware. When Netlify's
Dashboard overrides the repository command with `npm run build`, it detects
Netlify and still produces the required `.next` output. Outside Netlify, the
same command preserves the existing Vinext build.

Connect the `rakhaviantoni/prifyn` repository in Netlify. If Netlify asks for a base directory, leave it empty because `package.json` and `netlify.toml` are in the repository root.

## Production environment variables

Add secrets through **Site configuration → Environment variables**. Do not commit their real values.

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | The public HTTPS origin, such as `https://prifyn.netlify.app` or `https://app.prifyn.com` |
| `PRIFYN_APP_HOSTNAME` | App subdomain hostname without protocol or path. Supports comma-separated hosts, such as `app.prifyn.my.id,app.prifyn.rakhaviantoni.com` |
| `DATABASE_URL` | Supabase pooled PostgreSQL connection string |
| `BETTER_AUTH_URL` | The same public HTTPS origin as `NEXT_PUBLIC_APP_URL` |
| `BETTER_AUTH_SECRET` | A high-entropy secret of at least 32 characters |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated exact HTTPS origins allowed to call auth |
| `BETTER_AUTH_ALLOWED_HOSTS` | Optional comma-separated hostnames when one deploy serves multiple domains |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SUPABASE_URL` | Supabase project URL, such as `https://project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service role key for Storage uploads |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket for uploaded assets, default `prifyn-assets` |
| `PRIFYN_ADMIN_EMAILS` | Comma-separated emails allowed to open PRIFYN Business Manager, for example `privynindonesia@gmail.com` |
| `REPORT_SCHEDULE_SECRET` | Bearer token used by the scheduled report runner |
| `WEBHOOK_DELIVERY_SECRET` | Bearer token used by the webhook delivery runner |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` unless the provider specifies another OpenAI-compatible endpoint |
| `DEEPSEEK_API_KEY` | DeepSeek API key for Ask PRIFYN |
| `DEEPSEEK_MODEL` | Enabled model identifier, such as `deepseek-chat` |

Do not put `/app` or `/api/auth` in `BETTER_AUTH_URL`; it must be the site origin only. Do not include a trailing slash. If app and creator run on subdomains, include every production origin in `BETTER_AUTH_TRUSTED_ORIGINS` and every hostname in `BETTER_AUTH_ALLOWED_HOSTS`.

Brand logo uploads use Supabase Storage. Create the configured bucket before
deploying upload features. If the bucket is public, PRIFYN stores public object
URLs for brand logos; private creator documents should use a separate private
bucket later.

### Before a custom domain

For a Netlify site named `prifyn-growth-os`:

```text
NEXT_PUBLIC_APP_URL=https://prifyn-growth-os.netlify.app
BETTER_AUTH_URL=https://prifyn-growth-os.netlify.app
BETTER_AUTH_TRUSTED_ORIGINS=https://prifyn-growth-os.netlify.app
BETTER_AUTH_ALLOWED_HOSTS=prifyn-growth-os.netlify.app
```

### After adding a custom domain

For the current app domain:

```text
NEXT_PUBLIC_APP_URL=https://app.prifyn.rakhaviantoni.com
BETTER_AUTH_URL=https://app.prifyn.rakhaviantoni.com
BETTER_AUTH_TRUSTED_ORIGINS=https://app.prifyn.rakhaviantoni.com,https://prifyn-growth-os.netlify.app
BETTER_AUTH_ALLOWED_HOSTS=app.prifyn.rakhaviantoni.com,prifyn-growth-os.netlify.app
PRIFYN_APP_HOSTNAME=app.prifyn.rakhaviantoni.com
NEXT_PUBLIC_PRIFYN_APP_HOSTNAME=app.prifyn.rakhaviantoni.com
```

If the application is later served from `app.prifyn.com`:

```text
NEXT_PUBLIC_APP_URL=https://app.prifyn.com
BETTER_AUTH_URL=https://app.prifyn.com
BETTER_AUTH_TRUSTED_ORIGINS=https://app.prifyn.com,https://prifyn-growth-os.netlify.app
BETTER_AUTH_ALLOWED_HOSTS=app.prifyn.com,prifyn-growth-os.netlify.app
```

Use the exact domain Netlify shows. The temporary `netlify.app` hostname may remain trusted during rollout, or be removed after all traffic is forced to the custom domain.

## App subdomain

Add `app.prifyn.rakhaviantoni.com` as a custom domain alias for the same Netlify
site. At the DNS provider for `rakhaviantoni.com`, create the CNAME record shown
by Netlify (normally host `app.prifyn` pointing to the site's `netlify.app`
hostname). Do not guess the target; copy the exact value from Netlify's domain
setup screen.

The application routing is hostname-aware. On the app subdomain, `/` renders
the workspace while public URLs such as `/app/reports` are redirected to the
clean `/reports` form. The primary marketing domain continues to use `/app` so
existing links and development URLs remain compatible.

## Google OAuth

In the Google Cloud OAuth web client, add:

```text
Authorized JavaScript origin:
https://app.prifyn.rakhaviantoni.com

Authorized redirect URI:
https://app.prifyn.rakhaviantoni.com/api/auth/callback/google
```

Before the custom domain is active, use the equivalent `https://<site-name>.netlify.app` URLs. Google does not accept wildcard redirect URIs, so do not enable Google OAuth on arbitrary Deploy Preview URLs. Test OAuth on the production hostname or a dedicated stable branch domain.

## Database

Run the checked-in Drizzle migrations against the production database before enabling sign-up:

```bash
npm run db:migrate
```

Use Supabase's pooled connection string for serverless production traffic. Keep the service role and database credentials server-only.

## Deploy Preview policy

Deploy Previews can render public pages without production secrets. If previews need application data, create a separate preview database and preview-scoped credentials. Do not reuse production OAuth or production database credentials on untrusted branches.
