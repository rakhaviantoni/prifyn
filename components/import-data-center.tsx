"use client";

import {
  ArrowRight, CheckCircle, Database, FileArrowUp, FileCsv, FileXls, Info,
  PlugsConnected, Table, Warning,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import type JSZip from "jszip";
import { detectImportTemplate, importTemplates, mapHeaders, parseCsvPreview } from "@/lib/imports/metric-mapping";

type ParsedPreview = { headers: string[]; rows: string[][]; totalRows: number; fileName?: string; extension?: string };
type ImportBatch = { id: string; fileName: string; source: string; rows: number; acceptedRows?: number; rejectedRows?: number; importedAt: string; status: string };
type ImportFeedback = { tone: "info" | "success" | "error"; title: string; detail: string } | null;

const reportPatterns = [
  ["Funnel journey", "Impressions → clicks → landing views → leads/orders → revenue → repeat purchase"],
  ["Audience", "Age, gender, device, new vs returning, creator audience fit"],
  ["Location", "Country, province, city, store/serviceable area"],
  ["Creative", "Ad or creator asset, hook, CTA, format, fatigue, quality ranking"],
  ["Commerce outcome", "Orders, GMV/revenue, cancellations, product, marketplace source"],
];

async function parseXlsxPreview(file: File): Promise<Omit<ParsedPreview, "fileName" | "extension">> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const sharedStrings = await readSharedStrings(zip);
  const sheetPath = await findFirstWorksheetPath(zip);
  const sheetXml = await zip.file(sheetPath)?.async("text");
  if (!sheetXml) throw new Error("Worksheet not found");

  const xml = new DOMParser().parseFromString(sheetXml, "application/xml");
  const rows = Array.from(xml.getElementsByTagName("row")).map(row => {
    const cells = Array.from(row.getElementsByTagName("c"));
    const values: string[] = [];
    cells.forEach(cell => {
      const reference = cell.getAttribute("r") ?? "";
      const columnIndex = reference ? columnLettersToIndex(reference.replace(/\d+/g, "")) : values.length;
      values[columnIndex] = readCellValue(cell, sharedStrings);
    });
    return values.map(value => value ?? "");
  }).filter(row => row.some(Boolean));

  const headers = rows[0]?.map((header, index) => header.trim() || `Column ${index + 1}`) ?? [];
  return { headers, rows: rows.slice(1), totalRows: Math.max(rows.length - 1, 0) };
}

async function readSharedStrings(zip: JSZip) {
  const xmlText = await zip.file("xl/sharedStrings.xml")?.async("text");
  if (!xmlText) return [];
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  return Array.from(xml.getElementsByTagName("si")).map(item => Array.from(item.getElementsByTagName("t")).map(node => node.textContent ?? "").join(""));
}

async function findFirstWorksheetPath(zip: JSZip) {
  const workbookText = await zip.file("xl/workbook.xml")?.async("text");
  const relsText = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");
  if (!workbookText || !relsText) return "xl/worksheets/sheet1.xml";

  const workbook = new DOMParser().parseFromString(workbookText, "application/xml");
  const firstSheet = workbook.getElementsByTagName("sheet")[0];
  const relationshipId = firstSheet?.getAttribute("r:id");
  if (!relationshipId) return "xl/worksheets/sheet1.xml";

  const rels = new DOMParser().parseFromString(relsText, "application/xml");
  const relationship = Array.from(rels.getElementsByTagName("Relationship")).find(item => item.getAttribute("Id") === relationshipId);
  const target = relationship?.getAttribute("Target") ?? "worksheets/sheet1.xml";
  return target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^xl\//, "")}`;
}

function readCellValue(cell: Element, sharedStrings: string[]) {
  const type = cell.getAttribute("t");
  if (type === "inlineStr") return Array.from(cell.getElementsByTagName("t")).map(node => node.textContent ?? "").join("");
  const rawValue = cell.getElementsByTagName("v")[0]?.textContent ?? "";
  if (type === "s") return sharedStrings[Number(rawValue)] ?? "";
  return rawValue;
}

function columnLettersToIndex(letters: string) {
  return letters.split("").reduce((total, letter) => total * 26 + letter.toUpperCase().charCodeAt(0) - 64, 0) - 1;
}

export function ImportDataCenter() {
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ImportFeedback>(null);
  const [isReading, setIsReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedBatches, setImportedBatches] = useState<ImportBatch[]>([]);
  const detected = useMemo(() => preview ? detectImportTemplate(preview.headers) : null, [preview]);
  const mapping = useMemo(() => detected && preview ? mapHeaders(preview.headers, detected.template) : null, [detected, preview]);

  useEffect(() => {
    let active = true;
    fetch("/api/imports")
      .then(response => response.ok ? response.json() : { imports: [] })
      .then((data: { imports?: ImportBatch[] }) => { if (active) setImportedBatches(data.imports ?? []); })
      .catch(() => { if (active) setImportedBatches([]); });
    return () => { active = false; };
  }, []);

  async function readFile(file: File) {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    setIsReading(true);
    setFeedback(null);
    try {
      if (extension === ".csv") {
        const text = await file.text();
        setPreview({ ...parseCsvPreview(text), fileName: file.name, extension });
        setMessage("CSV preview generated. Review detected source and mapped metrics before importing.");
        return;
      }
      if (extension === ".xlsx") {
        const parsed = await parseXlsxPreview(file);
        setPreview({ ...parsed, fileName: file.name, extension });
        setMessage("XLSX preview generated. Review detected source and mapped metrics before importing.");
        return;
      }
      setPreview(null);
      setMessage("Upload a CSV or XLSX export from your ads, analytics, marketplace, or affiliate platform.");
    } catch {
      setPreview(null);
      setMessage("PRIFYN could not read this file. Try exporting it again as CSV or XLSX, then upload the fresh file.");
    } finally {
      setIsReading(false);
    }
  }

  function clearPreview() {
    setPreview(null);
    setMessage(null);
    setFeedback(null);
  }

  async function finishImport() {
    if (!preview || !detected || !mapping) {
      setFeedback({
        tone: "error",
        title: "Import belum bisa dilanjutkan",
        detail: "File ini belum cocok dengan template import yang didukung. Upload export platform yang sesuai atau pakai template PRIFYN.",
      });
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    setImporting(true);
    setMessage(null);
    setFeedback({
      tone: "info",
      title: "Importing to database",
      detail: `Writing ${preview.totalRows} mapped rows from ${preview.fileName ?? "this file"} into this workspace. Keep this tab open for a moment.`,
    });
    try {
      const response = await fetch("/api/imports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          fileName: preview.fileName,
          extension: preview.extension,
          sourceType: detected.template.id,
          sourceLabel: detected.template.label,
          headers: preview.headers,
          rows: preview.rows,
          totalRows: preview.totalRows,
          mapping,
        }),
      });
      const data = await response.json().catch(() => ({})) as { import?: ImportBatch; duplicate?: boolean; error?: string; reason?: string };
      if (!response.ok || !data.import) {
        throw new Error(data.error || (data.reason === "database_unreachable" ? "PRIFYN could not reach the database. Check DATABASE_URL and migrations before importing." : `Import failed before rows were written. HTTP ${response.status}`));
      }
      setImportedBatches(current => [data.import!, ...current.filter(item => item.id !== data.import!.id)].slice(0, 8));
      setPreview(null);
      setFeedback({
        tone: "success",
        title: data.duplicate ? "File already imported" : "Import complete",
        detail: data.duplicate
          ? `${data.import.fileName} was already imported. PRIFYN kept the existing database batch to avoid duplicate facts.`
          : `${data.import.fileName} imported successfully. ${data.import.acceptedRows ?? data.import.rows} of ${data.import.rows} rows are ready for dashboard metrics, campaign results, and reports.`,
      });
    } catch (error) {
      const detail = error instanceof DOMException && error.name === "AbortError"
        ? "Import request timed out after 20 seconds. The database may be unreachable or the file is too large. Try again, or check DATABASE_URL and migrations."
        : error instanceof Error ? error.message : "Import failed before rows were written.";
      setFeedback({ tone: "error", title: "Import failed", detail });
    } finally {
      window.clearTimeout(timeout);
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const headers = importTemplates[0].requiredColumns.concat(importTemplates[0].optionalColumns.filter(column => !importTemplates[0].requiredColumns.includes(column)));
    const sample = [
      headers.join(","),
      ["May_HT_Awareness 2026", "May HT Awareness 3", "598386", "483436", "440821", "440821", "2026-05-01", "2026-05-31", "May_HT_Awareness 2026", "inactive", "Reach", "1357.43", "7-day click or 1-day view", "-", "-", "-"].join(","),
    ];
    const url = URL.createObjectURL(new Blob([sample.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "prifyn-meta-ads-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="import-center">
    <header className="app-page-head import-head"><div><span>Data operations</span><h1>Data Imports</h1><p>Use platform exports while OAuth/API approvals are still pending. PRIFYN keeps raw imports, mapping rules, normalized rows, and source confidence separate.</p></div><button className="button button-outline" type="button" onClick={downloadTemplate}><FileCsv /> Download Meta template</button></header>

    <section className="surface import-hero">
      <div><span className="section-kicker">Import-first growth data</span><h2>Upload exports from Meta, TikTok, Google, Shopee, Tokopedia, or affiliate sheets.</h2><p>This is the practical bridge before seamless integrations: export from the platform, import into PRIFYN, map fields, then reports can calculate performance, journey, location, creative, and ROAS with evidence labels.</p></div>
      <label className="import-dropzone"><input type="file" accept=".csv,.xlsx" onChange={event => event.target.files?.[0] && void readFile(event.target.files[0])} /><FileArrowUp weight="duotone" /><strong>{isReading ? "Reading export…" : "Drop or choose CSV/XLSX export"}</strong><span>Preview rows, detect the source, then map metrics before importing.</span></label>
    </section>

    {message && <div className="report-explainer import-message" role="status"><strong>{preview ? "Import preview ready" : "Import needs attention"}</strong><span>{message}</span><button type="button" onClick={() => setMessage(null)}>Close</button></div>}
    {feedback && <div className={`import-feedback ${feedback.tone}`} role={feedback.tone === "error" ? "alert" : "status"}>
      <span>{feedback.tone === "success" ? <CheckCircle weight="fill" /> : feedback.tone === "error" ? <Warning weight="fill" /> : <Database weight="duotone" />}</span>
      <div><strong>{feedback.title}</strong><small>{feedback.detail}</small></div>
      <button type="button" onClick={() => setFeedback(null)}>Dismiss</button>
    </div>}

    <section className="import-grid">
      <div className="stack">
        <section className="surface import-preview-card">
          <div className="surface-head"><h2>Uploaded file</h2>{preview && <button type="button" onClick={clearPreview}>Clear</button>}</div>
          {!preview ? <div className="import-empty"><Database weight="duotone" /><h3>No file selected yet.</h3><p>Upload a platform export or download the Meta template to see how PRIFYN maps fields.</p></div> : <div className="import-file-summary">
            <span>{preview.extension === ".xlsx" ? <FileXls /> : <FileCsv />}</span><div><strong>{preview.fileName}</strong><small>{preview.extension?.toUpperCase()} · {preview.totalRows ? `${preview.totalRows} rows detected` : "Ready to map"}</small></div>
            <b className={`status-pill ${detected ? "" : "warning"}`}>{detected ? "Template detected" : "Needs mapping"}</b>
          </div>}
          {preview?.headers.length ? <div className="import-table-wrap"><table className="data-table"><thead><tr>{preview.headers.slice(0, 8).map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{preview.rows.slice(0, 4).map((row, index) => <tr key={index}>{preview.headers.slice(0, 8).map((header, cellIndex) => <td key={header}>{row[cellIndex] || "-"}</td>)}</tr>)}</tbody></table></div> : null}
          {preview?.headers.length ? <div className="import-finish-bar"><div><strong>Ready to finish import?</strong><span>{detected ? `${detected.template.label} detected. ${preview.totalRows} rows will be added to the workspace import history.` : "Choose a supported mapping before importing."}</span></div><button type="button" className="button button-dark" disabled={!detected || importing} onClick={finishImport}>{importing ? "Importing…" : "Import to workspace"} <ArrowRight /></button></div> : null}
        </section>

        <section className="surface import-mapping-card">
          <div className="surface-head"><h2>Detected mapping</h2><span>{detected ? `${detected.score} match score` : "No source selected"}</span></div>
          {detected && mapping ? <div className="mapping-list"><header><span><PlugsConnected /> {detected.template.label}</span><small>{detected.template.notes}</small></header>{Object.entries(mapping).slice(0, 12).map(([metric, column]) => <article key={metric}><strong>{metric.replaceAll("_", " ")}</strong><span className={column ? "mapped" : "missing"}>{column ?? "Not found"}</span></article>)}</div> : <div className="import-empty compact"><Info weight="duotone" /><p>Upload CSV data or choose a template. PRIFYN will keep unmapped columns as raw evidence instead of silently dropping them.</p></div>}
        </section>
      </div>

      <aside className="stack">
        <section className="surface import-history-card"><div className="surface-head"><h2>Imported batches</h2><span>{importedBatches.length ? `${importedBatches.length} recent` : "None yet"}</span></div>{importedBatches.length ? <div className="import-history-list">{importedBatches.map(batch => <article key={batch.id}><CheckCircle weight="fill" /><div><strong>{batch.fileName}</strong><small>{batch.source} · {batch.rows} rows · {new Date(batch.importedAt).toLocaleDateString("en-GB")}</small></div><span className="status-pill">{batch.status}</span></article>)}</div> : <div className="import-empty compact"><Database weight="duotone" /><p>Finished imports will appear here with source, row count, and report-readiness status.</p></div>}</section>
        <section className="surface import-sources-card"><div className="surface-head"><h2>Supported sources</h2></div>{importTemplates.map(template => <article key={template.id} className={detected?.template.id === template.id ? "active" : ""}><div><strong>{template.label}</strong><small>{template.platform} · {template.supportedExtensions.join(", ")}</small></div><span>{template.requiredColumns.length} required</span></article>)}</section>
        <section className="surface import-flow-card"><Database weight="duotone" /><h2>Import flow</h2>{["Upload export", "Preview rows", "Detect and review mapping", "Write rows to database", "Use evidence in reports"].map((item, index) => <div key={item}><b>{preview && index < 3 || importedBatches.length && index < 5 ? <CheckCircle weight="fill" /> : index + 1}</b><span>{item}</span></div>)}</section>
        <section className="surface import-pattern-card"><Table weight="duotone" /><h2>Report coverage from attachments</h2>{reportPatterns.map(([title, detail]) => <article key={title}><CheckCircle weight="fill" /><div><strong>{title}</strong><small>{detail}</small></div></article>)}</section>
        <section className="surface import-warning-card"><Warning weight="duotone" /><h2>Important</h2><p>Google login does not connect Ads, GA4, or YouTube automatically. Every marketing/commerce channel needs a separate authorization or export import.</p><a href="/app/settings/connections">Open connections <ArrowRight /></a></section>
      </aside>
    </section>
  </div>;
}
