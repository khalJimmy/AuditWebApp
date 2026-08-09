import React, { useState } from 'react';
import { AuditReport, AuditTask } from '../types';
import * as XLSX from 'xlsx';

interface RecordsViewProps {
  audits: AuditReport[];
  tasks: AuditTask[];
  onToast: (msg: string) => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({ audits, tasks, onToast }) => {
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const q = search.toLowerCase().trim();
  let filtered = audits;

  if (q) {
    filtered = filtered.filter(
      a =>
        a.auditId.toLowerCase().includes(q) ||
        a.dept.toLowerCase().includes(q) ||
        a.fn.toLowerCase().includes(q) ||
        a.auditor.toLowerCase().includes(q)
    );
  }

  if (zoneFilter) {
    filtered = filtered.filter(a => a.zone === zoneFilter);
  }

  const previewRecord = (a: AuditReport) => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = (a.findings || [])
      .map(
        (f, i) => `<tr>
      <td>${i + 1}</td>
      <td><strong>${f.type === 't1' ? 'Continuous Improvement (CI)' : f.type === 't2' ? 'Observation' : f.type === 't3' ? `Process Risk (${f.subtype || 'Process'})` : 'Non-Compliance (NC)'}</strong></td>
      <td>${f.process || '—'}</td>
      <td>${f.description || '—'}</td>
      <td>${f.evidence || '—'}</td>
      <td>${f.imm || f.mitigation || '—'}</td>
      <td>${f.rc || '—'}</td>
      <td>${f.capa || '—'}</td>
      <td>${f.dueDate || '—'}</td>
      <td>${f.responsible || '—'}</td>
    </tr>`
      )
      .join('');

    w.document.write(`<!DOCTYPE html><html><head><title>Audit ${a.auditId}</title>
  <style>body{font-family:Arial,sans-serif;padding:28px;max-width:1100px;margin:auto;font-size:12px;}
  h1{color:#c8401a;border-bottom:2px solid #c8401a;padding-bottom:8px;font-size:20px;}
  h2{font-size:14px;margin:18px 0 8px;color:#333;}
  .meta{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px;}
  .mv{background:#f4f2ec;border-radius:6px;padding:8px 12px;font-size:12px;}
  .mv strong{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:#666;margin-bottom:2px;}
  table{width:100%;border-collapse:collapse;font-size:11px;margin:10px 0;}
  th{background:#0f1117;color:#fff;padding:6px 8px;text-align:left;}
  td{padding:6px 8px;border:1px solid #ddd;}
  tr:nth-child(even){background:#f9f9f9;}
  .score{display:inline-block;font-size:22px;font-weight:700;color:#c8401a;}
  @media print{button{display:none;}}</style></head><body>
  <h1>Process Audit Report — ${a.auditId}</h1>
  <div class="meta">
    <div class="mv"><strong>Audit Date</strong>${a.auditDate}</div>
    <div class="mv"><strong>Department</strong>${a.dept}</div>
    <div class="mv"><strong>Function</strong>${a.fn}</div>
    <div class="mv"><strong>Zone</strong>${a.zone || '—'}</div>
    <div class="mv"><strong>Auditor</strong>${a.auditor}</div>
    <div class="mv"><strong>Auditee</strong>${a.auditee || '—'}</div>
    <div class="mv"><strong>HOD</strong>${a.hod || '—'}</div>
    <div class="mv"><strong>Compliance</strong><span class="score">${a.compliancePct}</span></div>
    <div class="mv"><strong>Process Score</strong><span class="score">${a.processScore}/1000</span></div>
  </div>
  <h2>Findings (${a.findings.length} total)</h2>
  <table><thead><tr><th>#</th><th>Type</th><th>Process</th><th>Description</th><th>Evidence</th><th>Immediate Action / Mitigation</th><th>Root Cause</th><th>CAPA</th><th>Due Date</th><th>Responsible</th></tr></thead><tbody>${rows}</tbody></table>
  <button onclick="window.print()" style="margin-top:16px;padding:8px 20px;background:#c8401a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">🖨 Print / Save PDF</button>
  </body></html>`);
    w.document.close();
  };

  const exportAll = () => {
    const wb = XLSX.utils.book_new();

    const data = audits.map(a => ({
      'Audit ID': a.auditId,
      'Audit Date': a.auditDate,
      'Zone': a.zone || '—',
      'Department': a.dept,
      'Function': a.fn,
      'Auditor': a.auditor,
      'Compliance %': a.compliancePct,
      'Process Score': a.processScore,
      'NC Count': a.ncCount,
      'Observations': a.obsCount,
      'Risks': a.riskCount,
      'CI': a.ciCount,
      'Status': a.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Records');
    XLSX.writeFile(wb, `Audit_Records_Archive_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('✅ Exported all records to Excel');
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            Audit <em>Records</em>
          </div>
          <div className="ps">Complete archive of all submitted audits</div>
        </div>
        <button className="btn btn-b btn-sm" onClick={exportAll}>
          ⬇ Export All
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '11px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by dept / auditor / ID…"
            style={{ maxWidth: '260px' }}
          />
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
          >
            <option value="">All Zones</option>
            <option>Chennai</option>
            <option>Coimbatore</option>
            <option>Bangalore</option>
          </select>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Date</th>
                <th>Zone</th>
                <th>Dept / Function</th>
                <th>Auditor</th>
                <th>Compliance%</th>
                <th>NC</th>
                <th>Obs</th>
                <th>Risk</th>
                <th>CI</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '22px', color: 'var(--muted)' }}>
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map(a => {
                  const t = tasks.find(x => x.auditId === a.auditId);
                  const st = t ? t.status : 'Not Dispatched';
                  const stBadge = st === 'Closed' || st === 'Completed' ? 'bg' : st === 'Notified' ? 'bb' : 'bm';

                  return (
                    <tr key={a.auditId}>
                      <td>
                        <span className="badge bk" style={{ fontSize: '10px' }}>
                          {a.auditId}
                        </span>
                      </td>
                      <td>{a.auditDate}</td>
                      <td>
                        <span className={`badge ${a.zone === 'Chennai' ? 'bb' : a.zone === 'Coimbatore' ? 'by' : 'bg'}`}>
                          {a.zone || '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.dept}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{a.fn}</div>
                      </td>
                      <td>{a.auditor}</td>
                      <td style={{ fontWeight: 700, color: 'var(--red)' }}>{a.compliancePct}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge br">{a.ncCount}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge by">{a.obsCount}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge bo">{a.riskCount}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge bg">{a.ciCount}</span>
                      </td>
                      <td>
                        <span className={`badge ${stBadge}`}>{st}</span>
                      </td>
                      <td>
                        <button className="btn btn-o btn-xs" onClick={() => previewRecord(a)}>
                          👁 View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
