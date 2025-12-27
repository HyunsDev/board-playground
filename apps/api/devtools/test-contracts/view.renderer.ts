import { ContractCheckSummary } from './runner';
import { CheckResultRow } from './types';

type RenderOptions = {
  summary: ContractCheckSummary;
  durationSeconds: string;
};

export function renderHtml({ summary, durationSeconds }: RenderOptions): string {
  const { contractImplemented, contractMissing, accessImplemented, accessMissing } =
    summary.analysisResult.result;

  const statusClass = summary.success ? 'pass' : 'fail';
  const statusLabel = summary.success ? 'PASS' : 'FAIL';

  const resultsRows = renderResults(summary.analysisResult.result.results);
  const extraRouteRows = renderExtraRoutes(summary.extraRoutes);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test Contract Report</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #0f172a;
        --panel: #111827;
        --muted: #9ca3af;
        --line: #1f2937;
        --success: #22c55e;
        --danger: #ef4444;
        --warn: #f97316;
        --accent: #38bdf8;
        --card: rgba(255, 255, 255, 0.02);
        --text: #e5e7eb;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        font-family: "Space Grotesk", "Segoe UI", "Inter", sans-serif;
        background: radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.12), transparent 25%),
          radial-gradient(circle at 80% 0%, rgba(250, 204, 21, 0.12), transparent 30%),
          var(--bg);
        color: var(--text);
      }
      main {
        max-width: 1100px;
        margin: 40px auto;
        padding: 0 20px 80px;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      h1 {
        margin: 0;
        letter-spacing: -0.01em;
        font-size: 28px;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--line);
        font-weight: 700;
        color: var(--text);
      }
      .status.pass { border-color: var(--success); color: var(--success); }
      .status.fail { border-color: var(--danger); color: var(--danger); }
      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }
      .metric {
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--card);
        border: 1px solid var(--line);
      }
      .metric label {
        font-size: 12px;
        color: var(--muted);
        letter-spacing: 0.02em;
      }
      .metric strong {
        display: block;
        margin-top: 4px;
        font-size: 18px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: var(--panel);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      }
      thead {
        background: rgba(255, 255, 255, 0.03);
      }
      th, td {
        padding: 14px 16px;
        text-align: left;
        vertical-align: top;
      }
      th {
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }
      tbody tr:nth-child(odd) { background: rgba(255, 255, 255, 0.01); }
      tbody tr:hover { background: rgba(56, 189, 248, 0.08); transition: background 120ms ease; }
      .separator td { padding: 0; }
      .separator div { border-bottom: 1px dashed var(--line); margin: 6px 0; }
      .group td {
        color: var(--text);
        font-weight: 700;
        letter-spacing: 0.01em;
        background: rgba(255, 255, 255, 0.02);
      }
      .cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 6px;
        font-weight: 800;
      }
      .row.pass .indicator { background: rgba(34, 197, 94, 0.15); color: var(--success); }
      .row.fail .indicator { background: rgba(239, 68, 68, 0.18); color: var(--danger); }
      .contract-key { font-weight: 700; letter-spacing: -0.01em; }
      .route { color: var(--muted); font-size: 13px; margin-left: 6px; }
      .access {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        font-weight: 700;
      }
      .access .expected { color: var(--muted); }
      .access .actual { color: var(--warn); }
      .access .ok { color: var(--muted); }
      .access .warn { color: var(--danger); }
      .extra {
        background: rgba(249, 115, 22, 0.08);
      }
      .extra .route { color: var(--warn); }
      footer {
        margin-top: 18px;
        color: var(--muted);
        font-size: 13px;
      }
      @media (max-width: 720px) {
        header { flex-direction: column; align-items: flex-start; }
        table, thead, tbody, th, td, tr { display: block; }
        thead { display: none; }
        td { padding: 12px 10px; }
        .cell { flex-wrap: wrap; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>Test Contract Report</h1>
          <div class="status ${statusClass}">${statusLabel} • ${summary.extraRoutes.length} extra routes</div>
        </div>
        <div class="status" style="color: var(--muted); border-color: var(--line);">Took ${durationSeconds}s</div>
      </header>

      <div class="metrics">
        <div class="metric">
          <label>Contract coverage</label>
          <strong>${contractImplemented} passed / ${contractMissing} missing</strong>
        </div>
        <div class="metric">
          <label>Access rules</label>
          <strong>${accessImplemented} passed / ${accessMissing} failed</strong>
        </div>
        <div class="metric">
          <label>Extra routes in Nest</label>
          <strong>${summary.extraRoutes.length}</strong>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Contract / Route</th>
            <th>Access</th>
            <th>Controller</th>
          </tr>
        </thead>
        <tbody>
          ${resultsRows}
          ${extraRouteRows}
        </tbody>
      </table>

      <footer>Generated from NestJS routes vs ts-rest contract on demand.</footer>
    </main>
  </body>
</html>`;
}

function renderResults(rows: CheckResultRow[]): string {
  return rows
    .map((row) => {
      if (row.type === 'separator') {
        return `<tr class="separator"><td colspan="3"><div></div></td></tr>`;
      }
      if (row.type === 'group') {
        return `<tr class="group"><td colspan="3">${escapeHtml(row.name)}</td></tr>`;
      }
      return renderRow(row);
    })
    .join('');
}

function renderRow(row: Extract<CheckResultRow, { type: 'row' }>): string {
  const indentLevel = Math.max(0, row.indent.length / 2);
  const padding = indentLevel * 14;
  const statusClass = row.status === 'pass' ? 'pass' : 'fail';
  const indicator = row.status === 'pass' ? '✔' : '✘';

  return `<tr class="row ${statusClass}">
    <td>
      <div class="cell" style="padding-left:${padding}px">
        <span class="indicator">${indicator}</span>
        <span class="contract-key">${escapeHtml(row.key)}</span>
        <span class="route">${escapeHtml(row.routeStr)}</span>
      </div>
    </td>
    <td>${renderAccess(row)}</td>
    <td>${escapeHtml(row.controller)}</td>
  </tr>`;
}

function renderAccess(row: Extract<CheckResultRow, { type: 'row' }>): string {
  if (!row.accessDisplay) return '';
  if (row.accessDisplay === 'undefined') {
    return `<span class="access"><span class="warn">undefined</span></span>`;
  }
  if (row.accessStatus === 'match') {
    return `<span class="access"><span class="ok">${escapeHtml(row.accessDisplay)}</span></span>`;
  }
  const [expected = '', actual = ''] = row.accessDisplay.split('/');
  return `<span class="access">
    <span class="expected">${escapeHtml(expected)}</span>
    <span class="actual">${escapeHtml(actual)}</span>
  </span>`;
}

function renderExtraRoutes(extraRoutes: ContractCheckSummary['extraRoutes']): string {
  if (extraRoutes.length === 0) return '';
  const rows = extraRoutes
    .map(
      (route) =>
        `<tr class="extra">
          <td><div class="cell"><span class="indicator">?</span> <span class="contract-key">${escapeHtml(route.method)} ${escapeHtml(route.path)}</span></div></td>
          <td class="route">${escapeHtml(route.accessInfo)}</td>
          <td class="route">${escapeHtml(route.controllerName)}</td>
        </tr>`,
    )
    .join('');

  return `<tr class="group"><td colspan="3">Extra Routes (defined only in Nest)</td></tr>${rows}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
