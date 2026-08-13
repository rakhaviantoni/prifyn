import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function request(path, init = {}) {
  const worker = await loadWorker();
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html", ...init.headers }, ...init }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const routes = [
  ["/", "Know what moves"],
  ["/features", "Every growth signal"],
  ["/pricing", "Start with decisions"],
  ["/book", "Start with a walkthrough"],
  ["/apply", "Tell us your growth problem first"],
  ["/docs", "How Growth OS works"],
  ["/growth", "See the whole growth system"],
  ["/solutions/brands", "Know when to scale"],
  ["/solutions/agencies", "Operate every client clearly"],
  ["/solutions/creators", "Find work that fits"],
  ["/blog", "Better growth starts"],
  ["/blog/growth-without-operational-readiness", "Demand is only half of growth"],
  ["/case-studies", "not fabricated customer claims"],
  ["/case-studies/restaurant-campaign-readiness", "Why the existing workflow broke down"],
  ["/auth/sign-in", "Welcome back"],
  ["/auth/sign-up", "Create your workspace"],
  ["/demo", "Preview sandbox"],
  ["/demo/creator", "Demo creator"],
  ["/privacy", "Privacy by design"],
  ["/terms", "Product preview terms"],
];

const privateRoutes = [
  ["/app", "Decision inbox"],
  ["/app/ads-window", "Ads Manager"],
  ["/app/leads", "Lead Inbox"],
  ["/app/kol-window", "KOL Campaigns"],
  ["/app/campaigns", "Campaign operations"],
  ["/app/creators", "Creator intelligence"],
  ["/app/creators/nabila-putri", "Nabila Putri"],
  ["/app/talent-pipeline", "Talent Pipeline"],
  ["/app/reports", "Reports"],
  ["/app/copilot", "Ask PRIFYN"],
  ["/app/settings", "Workspace governance"],
  ["/app/settings/connections", "Connected systems and permissions"],
  ["/app/settings/imports", "Data Imports"],
  ["/app/settings/team", "Company owners can invite users"],
  ["/app/settings/billing", "Workspace billing"],
  ["/creator", "Creator command center"],
  ["/creator/onboarding", "Creator onboarding"],
  ["/creator/profile", "Creator identity"],
  ["/creator/opportunities", "Matched opportunities"],
  ["/creator/applications", "Application tracking"],
  ["/creator/campaigns", "Active collaboration"],
  ["/creator/payments", "Track every agreed fee"],
  ["/creator/performance", "Performance intelligence"],
];

test("server-renders every public and product route", async () => {
  for (const [path, marker] of routes) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, path);
    const html = await response.text();
    assert.match(html, new RegExp(marker, "i"), path);
    assert.match(html, /PRIFYN/, path);
    assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/, path);
  }
});

test("private workspaces require authentication", async () => {
  for (const [path] of privateRoutes) {
    const response = await request(path, { redirect: "manual" });
    assert.equal(response.status, 307, path);
    const location = new URL(response.headers.get("location"), "http://localhost");
    assert.equal(location.pathname, "/auth/sign-in", path);
    assert.match(location.searchParams.get("returnTo") ?? "", /^\/(app|creator)$/, path);
  }
});

test("app and creator subdomain roots resolve to gated workspaces", async () => {
  const appResponse = await request("/", { headers: { host: "app.prifyn.rakhaviantoni.com" }, redirect: "manual" });
  assert.equal(appResponse.status, 307);
  const appLocation = new URL(appResponse.headers.get("location"), "http://localhost");
  assert.equal(appLocation.pathname, "/auth/sign-in");
  assert.equal(appLocation.searchParams.get("returnTo"), "/app");

  const creatorResponse = await request("/", { headers: { host: "creator.prifyn.rakhaviantoni.com" }, redirect: "manual" });
  assert.equal(creatorResponse.status, 307);
  const creatorLocation = new URL(creatorResponse.headers.get("location"), "http://localhost");
  assert.equal(creatorLocation.pathname, "/auth/sign-in");
  assert.equal(creatorLocation.searchParams.get("returnTo"), "/creator");
});

test("preview route redirects to the demo sandbox", async () => {
  const response = await request("/preview", { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, "/demo");

  const appResponse = await request("/preview/app", { redirect: "manual" });
  assert.equal(appResponse.status, 307);
  assert.equal(new URL(appResponse.headers.get("location"), "http://localhost").pathname, "/demo");

  const creatorResponse = await request("/preview/creator", { redirect: "manual" });
  assert.equal(creatorResponse.status, 307);
  assert.equal(new URL(creatorResponse.headers.get("location"), "http://localhost").pathname, "/demo/creator");
});

test("legacy ads page redirects to the broader growth story", async () => {
  const response = await request("/ads", { redirect: "manual" });
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")).pathname, "/growth");
});

test("AI endpoint fails safely without provider credentials", async () => {
  const response = await request("/api/ai/insights", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ question: "Why did ROAS decline this week?" }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.mode, "offline");
  assert.equal(body.confidence, "low");
  assert.match(body.answer, /AI provider is not connected/i);
  assert.match(body.why, /did not generate a business recommendation/i);
});

test("auth endpoint fails safely until credentials are supplied", async () => {
  const response = await request("/api/auth/configured", { headers: { accept: "application/json" } });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { configured: false, reason: "credentials" });
});

test("ships requested foundation packages and schema migrations", async () => {
  const [packageJson, schema, migration, workflowMigration, creatorMigration, billingMigration, integrationMigration, importMigration, envExample] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_amusing_human_fly.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_large_lester.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0002_regular_polaris.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0003_flashy_saracen.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0004_sour_mephistopheles.sql", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0005_wide_wolfpack.sql", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);
  assert.match(packageJson, /@phosphor-icons\/react/);
  assert.match(packageJson, /better-auth/);
  assert.match(schema, /campaigns/);
  assert.match(schema, /insightEvidence/);
  assert.match(migration, /CREATE TABLE "workspaces"/);
  assert.doesNotMatch(migration, /DROP TABLE|TRUNCATE|DELETE FROM/);
  assert.match(workflowMigration, /CREATE TABLE "ads_campaign_configs"/);
  assert.match(workflowMigration, /CREATE TABLE "kol_campaign_configs"/);
  assert.match(workflowMigration, /CREATE TABLE "platform_campaign_refs"/);
  assert.doesNotMatch(workflowMigration, /DROP TABLE|TRUNCATE|DELETE FROM/);
  assert.match(creatorMigration, /CREATE TABLE "creator_profiles"/);
  assert.match(creatorMigration, /CREATE TABLE "creator_applications"/);
  assert.match(creatorMigration, /CREATE TABLE "creator_scores"/);
  assert.match(creatorMigration, /CREATE TABLE "creator_payment_milestones"/);
  assert.doesNotMatch(creatorMigration, /DROP TABLE|TRUNCATE|DELETE FROM/);
  assert.match(billingMigration, /CREATE TABLE "workspace_subscriptions"/);
  assert.match(billingMigration, /CREATE TABLE "billing_invoices"/);
  assert.match(billingMigration, /CREATE TABLE "billing_usage"/);
  assert.doesNotMatch(billingMigration, /DROP TABLE|TRUNCATE|DELETE FROM/);
  assert.match(integrationMigration, /CREATE TABLE "provider_authorizations"/);
  assert.match(integrationMigration, /CREATE TABLE "brand_account_bindings"/);
  assert.match(integrationMigration, /CREATE TABLE "channel_publishing_jobs"/);
  assert.doesNotMatch(integrationMigration, /DROP TABLE|TRUNCATE|DELETE FROM/);
  assert.match(importMigration, /CREATE TABLE "import_mappings"/);
  assert.match(importMigration, /CREATE TABLE "import_rows"/);
  assert.doesNotMatch(importMigration, /DROP TABLE|TRUNCATE|DELETE FROM/);
  assert.match(envExample, /GOOGLE_CLIENT_ID/);
  assert.match(envExample, /PRIFYN_CREATOR_HOSTNAME/);
  assert.match(envExample, /DEEPSEEK_API_KEY/);
});

test("Creator Intelligence exposes honest connector readiness", async () => {
  const response = await request("/api/creator-intelligence/configured", { headers: { accept: "application/json" } });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.configured, true);
  assert.equal(body.connectors.payments.mode, "status-tracking");
  assert.equal(body.connectors.social.tiktok.mode, "public-link");
});
