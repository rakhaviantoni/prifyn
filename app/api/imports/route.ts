import { createHash } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  importJobs,
  importMappings,
  importRows,
  performanceFacts,
} from "@/db/schema";
import { importTemplates, type ImportSourceType } from "@/lib/imports/metric-mapping";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

const ImportPayload = z.object({
  fileName: z.string().min(1),
  extension: z.string().min(1),
  sourceType: z.string().min(1),
  sourceLabel: z.string().min(1),
  headers: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).max(10000),
  totalRows: z.number().int().nonnegative(),
  mapping: z.record(z.string(), z.string().nullable()),
});

const requiredImportTables = ["workspaces", "workspace_members", "organizations", "organization_members", "import_jobs", "import_mappings", "import_rows", "performance_facts"];

const numericMetrics = new Set([
  "results",
  "cost_per_result_idr",
  "spend_idr",
  "impressions",
  "reach",
  "clicks",
  "conversions",
  "orders",
  "revenue_idr",
  "ctr",
  "cvr",
  "roas",
  "creator_cost_idr",
]);

const dimensionMetrics = new Set([
  "campaign_name",
  "ad_set_name",
  "ad_name",
  "delivery_status",
  "result_type",
  "attribution_setting",
  "product_name",
  "creator_name",
  "platform",
  "coupon_code",
  "destination_url",
  "reporting_starts",
  "reporting_ends",
]);

function hash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function parseNumber(value: string | undefined) {
  if (!value) return null;
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function rowObject(headers: string[], row: string[]) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
}

function valueFor(mapping: Record<string, string | null>, raw: Record<string, string>, metric: string) {
  const column = mapping[metric];
  return column ? raw[column] : undefined;
}

function databaseErrorDetail(error: unknown) {
  const chain: Array<{ code?: string; message?: string; detail?: string }> = [];
  let current: unknown = error;
  while (current && typeof current === "object") {
    const item = current as { code?: string; message?: string; detail?: string; cause?: unknown };
    chain.push({ code: item.code, message: item.message, detail: item.detail });
    current = item.cause;
  }
  const code = chain.find(item => item.code)?.code;
  const message = chain.map(item => item.message).find(Boolean) ?? "The import could not be saved.";
  const detail = chain.map(item => item.detail).find(Boolean);
  const missingRelation = message.match(/relation "([^"]+)" does not exist/i)?.[1];
  const missingType = message.match(/type "([^"]+)" does not exist/i)?.[1];
  return { code, message, detail, missingRelation, missingType };
}

async function assertImportSchemaReady(db: ReturnType<typeof getDb>) {
  const result = await db.execute(sql<{ table_name: string }>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('workspaces', 'workspace_members', 'organizations', 'organization_members', 'import_jobs', 'import_mappings', 'import_rows', 'performance_facts')
  `);
  const rows = Array.isArray(result) ? result : [];
  const found = new Set(rows.map(row => row.table_name));
  const missing = requiredImportTables.filter(table => !found.has(table));
  return missing;
}

async function getWorkspaceContext(request: Request) {
  return getWorkspaceContextFromRequest(request);
}

function normalizeRows(jobId: string, payload: z.infer<typeof ImportPayload>) {
  const rows = payload.rows.map((row, index) => {
    const raw = rowObject(payload.headers, row);
    const dimensions = Object.fromEntries([...dimensionMetrics].map(metric => [metric, valueFor(payload.mapping, raw, metric) ?? null]).filter(([, value]) => value));
    const normalizedMetrics = Object.fromEntries([...numericMetrics].map(metric => [metric, parseNumber(valueFor(payload.mapping, raw, metric))]).filter(([, value]) => value !== null)) as Record<string, number>;
    const subjectId = String(dimensions.ad_name ?? dimensions.campaign_name ?? dimensions.product_name ?? dimensions.creator_name ?? `row-${index + 1}`);
    return {
      importJobId: jobId,
      rowNumber: index + 1,
      subjectType: payload.sourceType.includes("affiliate") ? "creator_campaign" : "campaign",
      subjectId,
      dimensions: { ...dimensions, raw },
      normalizedMetrics,
      rowHash: hash({ raw, index }),
      status: Object.keys(normalizedMetrics).length ? "accepted" : "needs_review",
      errors: Object.keys(normalizedMetrics).length ? [] : ["No numeric mapped metrics found."],
    };
  });
  return rows;
}

function normalizeFacts(workspaceId: string, organizationId: string, jobId: string, rows: ReturnType<typeof normalizeRows>, payload: z.infer<typeof ImportPayload>) {
  return rows.flatMap(row => {
    const start = parseDate(String(row.dimensions.reporting_starts ?? "")) ?? new Date();
    const end = parseDate(String(row.dimensions.reporting_ends ?? "")) ?? start;
    return Object.entries(row.normalizedMetrics).map(([metricKey, value]) => ({
      workspaceId,
      organizationId,
      subjectType: row.subjectType,
      subjectId: row.subjectId,
      metricKey,
      metricVersion: 1,
      periodStart: start,
      periodEnd: end,
      value: String(value),
      source: payload.sourceType,
      importJobId: jobId,
    }));
  });
}

function publicJob(job: typeof importJobs.$inferSelect, sourceLabel?: string) {
  const template = importTemplates.find(item => item.id === job.sourceType as ImportSourceType);
  return {
    id: job.id,
    fileName: job.objectKey,
    source: sourceLabel ?? template?.label ?? job.sourceType,
    sourceType: job.sourceType,
    rows: job.totalRows,
    acceptedRows: job.acceptedRows,
    rejectedRows: job.rejectedRows,
    importedAt: job.createdAt?.toISOString(),
    status: job.status === "completed" ? "Imported · ready for reports" : job.status,
  };
}

export async function GET(request: Request) {
  try {
    const { db, membership, brand } = await getWorkspaceContext(request);
    const url = new URL(request.url);
    const importId = url.searchParams.get("id");
    if (importId) {
      const [job] = await db.select().from(importJobs).where(and(
        eq(importJobs.id, importId),
        eq(importJobs.workspaceId, membership.organizationId),
        eq(importJobs.organizationId, brand.id),
      )).limit(1);
      if (!job) return Response.json({ error: "Import not found." }, { status: 404 });
      const [mapping] = await db.select().from(importMappings).where(and(
        eq(importMappings.workspaceId, membership.organizationId),
        eq(importMappings.organizationId, brand.id),
        eq(importMappings.sourceType, job.sourceType),
      )).orderBy(desc(importMappings.createdAt)).limit(1);
      const rows = await db.select().from(importRows).where(eq(importRows.importJobId, job.id)).orderBy(importRows.rowNumber).limit(12);
      const metricKeys = Array.from(new Set(rows.flatMap(row => Object.keys(row.normalizedMetrics ?? {}))));
      const dimensionKeys = Array.from(new Set(rows.flatMap(row => Object.keys(row.dimensions ?? {}).filter(key => key !== "raw"))));
      return Response.json({
        import: publicJob(job),
        mapping: mapping ? {
          name: mapping.name,
          notes: mapping.notes,
          columnMap: mapping.columnMap,
          requiredColumns: mapping.requiredColumns,
        } : null,
        metricKeys,
        dimensionKeys,
        sampleRows: rows.map(row => ({
          rowNumber: row.rowNumber,
          subjectId: row.subjectId,
          status: row.status,
          dimensions: row.dimensions,
          metrics: row.normalizedMetrics,
          errors: row.errors,
        })),
      });
    }
    const jobs = await db.select().from(importJobs).where(and(eq(importJobs.workspaceId, membership.organizationId), eq(importJobs.organizationId, brand.id))).orderBy(desc(importJobs.createdAt)).limit(8);
    return Response.json({ imports: jobs.map(job => publicJob(job)) });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ imports: [], reason: "database_unreachable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = ImportPayload.parse(await request.json());
    const template = importTemplates.find(item => item.id === payload.sourceType as ImportSourceType);
    if (!template) return Response.json({ error: "Unsupported import source." }, { status: 400 });

    const { db, session, membership, brand } = await getWorkspaceContext(request);
    const missingTables = await assertImportSchemaReady(db);
    if (missingTables.length) {
      return Response.json({
        error: "Import setup is not complete yet. Ask the workspace admin to finish setup, then try again.",
        reason: "missing_import_schema",
        missingTables,
      }, { status: 503 });
    }
    const checksum = hash({ fileName: payload.fileName, sourceType: payload.sourceType, rows: payload.rows });
    const existing = await db.select().from(importJobs).where(and(
      eq(importJobs.workspaceId, membership.organizationId),
      eq(importJobs.organizationId, brand.id),
      eq(importJobs.sourceType, payload.sourceType),
      eq(importJobs.checksum, checksum),
    )).limit(1);
    if (existing[0]) return Response.json({ import: publicJob(existing[0], payload.sourceLabel), duplicate: true });

    const created = await db.transaction(async tx => {
      const [job] = await tx.insert(importJobs).values({
        workspaceId: membership.organizationId,
        organizationId: brand.id,
        sourceType: payload.sourceType,
        objectKey: payload.fileName,
        checksum,
        mappingVersion: 1,
        status: "processing",
        totalRows: payload.totalRows,
        acceptedRows: 0,
        rejectedRows: 0,
        createdBy: session.user.id,
      }).returning();

      const normalizedRows = normalizeRows(job.id, payload);
      const acceptedRows = normalizedRows.filter(row => row.status === "accepted").length;
      const facts = normalizeFacts(membership.organizationId, brand.id, job.id, normalizedRows, payload);
      const columnMap = Object.fromEntries(Object.entries(payload.mapping).filter((entry): entry is [string, string] => Boolean(entry[1])));

      await tx.insert(importMappings).values({
        workspaceId: membership.organizationId,
        organizationId: brand.id,
        sourceType: payload.sourceType,
        name: payload.sourceLabel,
        mappingVersion: 1,
        supportedExtensions: template.supportedExtensions,
        requiredColumns: template.requiredColumns,
        columnMap,
        metricMap: columnMap,
        notes: template.notes,
      }).onConflictDoNothing();
      if (normalizedRows.length) await tx.insert(importRows).values(normalizedRows);
      if (facts.length) await tx.insert(performanceFacts).values(facts);
      const [updatedJob] = await tx.update(importJobs).set({
        status: "completed",
        acceptedRows,
        rejectedRows: normalizedRows.length - acceptedRows,
        errorSummary: normalizedRows.length === acceptedRows ? null : { rowsNeedingReview: normalizedRows.length - acceptedRows },
        updatedAt: new Date(),
      }).where(eq(importJobs.id, job.id)).returning();
      return updatedJob;
    });

    return Response.json({ import: publicJob(created, payload.sourceLabel) });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ error: "Invalid import payload.", details: error.flatten() }, { status: 400 });
    const detail = databaseErrorDetail(error);
    if (detail.missingRelation || detail.missingType) {
      return Response.json({
        error: "Import setup is not complete yet. Ask the workspace admin to finish setup, then try again.",
        reason: "missing_import_schema",
        code: detail.code,
        missingTables: detail.missingRelation ? [detail.missingRelation] : undefined,
      }, { status: 503 });
    }
    return Response.json({
      error: "Import reached the server but the database rejected it.",
      reason: "database_write_failed",
      code: detail.code,
      detail: detail.detail ?? detail.message,
    }, { status: 503 });
  }
}
