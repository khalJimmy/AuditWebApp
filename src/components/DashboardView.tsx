import React, { useState } from 'react';
import { AuditReport, AuditTask, AuditPlan, Department } from '../types';
import * as XLSX from 'xlsx';

interface DashboardViewProps {
  audits: AuditReport[];
  tasks: AuditTask[];
  plans: AuditPlan[];
  depts: Department[];
  onToast?: (msg: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ audits, tasks, plans, depts, onToast, onSelectTab }) => {
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Filtered Audits
  let filteredAudits = audits;
  if (zoneFilter) {
    filteredAudits = filteredAudits.filter(a => a.zone === zoneFilter);
  }
  if (monthFilter) {
    filteredAudits = filteredAudits.filter(a => {
      const d = new Date(a.auditDate);
      return months[d.getMonth()] === monthFilter;
    });
  }

  // Key metrics
  const totalAudits = filteredAudits.length;
  const totalNC = filteredAudits.reduce((s, a) => s + (a.ncCount || 0), 0);
  const relevantTasks = tasks.filter(t => filteredAudits.some(a => a.auditId === t.auditId));
  const closedNC = relevantTasks.filter(t => t.status === 'Closed').reduce((s, t) => s + t.findings.filter(f => f.type === 't4').length, 0);
  const openNC = Math.max(0, totalNC - closedNC);

  const isOverdue = (t: AuditTask) => {
    if (t.status === 'Closed' || t.status === 'Completed') return false;
    return Date.now() > new Date(t.dueAt).getTime();
  };

  const overdueCount = relevantTasks.filter(isOverdue).length;

  const avgCompliance = filteredAudits.length
    ? Math.round(filteredAudits.reduce((s, a) => s + parseInt(a.compliancePct || '0', 10), 0) / filteredAudits.length)
    : 0;

  const zones = [
    { name: 'Chennai', cls: 'zh-cn' },
    { name: 'Coimbatore', cls: 'zh-cb' },
    { name: 'Bangalore', cls: 'zh-bl' }
  ];

  const exportAll = () => {
    const wb = XLSX.utils.book_new();

    const summaryHeaders = [
      'Audit ID', 'Audit Date', 'Zone', 'Department', 'Function',
      'Auditor', 'Compliance %', 'NC Count', 'Observations', 'Risk', 'CI'
    ];
    const summaryRows = filteredAudits.map(a => [
      a.auditId, a.auditDate, a.zone || '—', a.dept, a.fn,
      a.auditor, a.compliancePct, a.ncCount, a.obsCount, a.riskCount, a.ciCount
    ]);

    const ws = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Summary');
    XLSX.writeFile(wb, `Casagrand_ProcessAudit_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast?.('✅ Exported dashboard summary to Excel');
  };

  const overdueTasksList = relevantTasks.filter(isOverdue);
  const recentPlans = [...plans].reverse().slice(0, 5);

  const [dashSection, setDashSection] = useState<'depts' | 'auditors' | 'spocs'>('depts');

  // AUDITOR METRICS COMPUTATION
  const auditorStats = React.useMemo(() => {
    const map: Record<string, { totalAudits: number; scores: number[]; plansCompleted: number; plansScheduled: number }> = {};

    audits.forEach(a => {
      const name = a.auditor || 'Unassigned';
      if (!map[name]) map[name] = { totalAudits: 0, scores: [], plansCompleted: 0, plansScheduled: 0 };
      map[name].totalAudits += 1;
      const score = parseInt(a.compliancePct || '0', 10);
      map[name].scores.push(score);
    });

    plans.forEach(p => {
      const name = p.auditor || 'Unassigned';
      if (!map[name]) map[name] = { totalAudits: 0, scores: [], plansCompleted: 0, plansScheduled: 0 };
      if (p.status === 'COMPLETED') map[name].plansCompleted += 1;
      else map[name].plansScheduled += 1;
    });

    return Object.entries(map).map(([name, data]) => {
      const avg = data.scores.length ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0;
      return { name, totalAudits: data.totalAudits, avgCompliance: avg, completed: data.plansCompleted, scheduled: data.plansScheduled };
    });
  }, [audits, plans]);

  // DEPARTMENT METRICS COMPUTATION
  const deptMetricsStats = React.useMemo(() => {
    const map: Record<string, { dept: string; fn: string; spocMail: string; hodMail: string; totalDispatches: number; closedOnTime: number; overdueBreached: number }> = {};

    depts.forEach(d => {
      const key = d.ref;
      map[key] = {
        dept: d.dept,
        fn: d.fn,
        spocMail: d.sm || 'Not Configured',
        hodMail: d.hm || 'Not Configured',
        totalDispatches: 0,
        closedOnTime: 0,
        overdueBreached: 0
      };
    });

    tasks.forEach(t => {
      const matchingDept = depts.find(d => d.dept === t.dept || d.fn === t.fn);
      const key = matchingDept ? matchingDept.ref : t.dept;
      if (!map[key]) {
        map[key] = {
          dept: t.dept,
          fn: t.fn,
          spocMail: t.spocMail || '—',
          hodMail: t.hodMail || '—',
          totalDispatches: 0,
          closedOnTime: 0,
          overdueBreached: 0
        };
      }
      map[key].totalDispatches += 1;
      if (t.status === 'Closed' || t.status === 'Completed') {
        map[key].closedOnTime += 1;
      }
      if (isOverdue(t)) {
        map[key].overdueBreached += 1;
      }
    });

    return Object.values(map).filter(m => m.totalDispatches > 0 || depts.some(d => d.dept === m.dept));
  }, [depts, tasks]);

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            Audit <em>Command Centre</em>
          </div>
          <div className="ps">Live status · All zones · Auditor &amp; Department SLA metrics</div>
        </div>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
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

          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
          >
            <option value="">All Months</option>
            {months.map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <button className="btn btn-o btn-sm" onClick={exportAll}>
            ⬇ Export
          </button>
        </div>
      </div>

      <div className="stats s5">
        <div className="sc r">
          <div className="sc-n">{totalAudits}</div>
          <div className="sc-l">Total Audits</div>
        </div>
        <div className="sc b">
          <div className="sc-n">{openNC}</div>
          <div className="sc-l">Open NCs</div>
        </div>
        <div className="sc g">
          <div className="sc-n">{closedNC}</div>
          <div className="sc-l">Closed</div>
        </div>
        <div className="sc o">
          <div className="sc-n">{overdueCount}</div>
          <div className="sc-l">TAT Overdue</div>
        </div>
        <div className="sc p">
          <div className="sc-n">{totalAudits ? `${avgCompliance}%` : '—'}</div>
          <div className="sc-l">Avg Compliance</div>
        </div>
      </div>

      {/* SECTION TOGGLE BUTTONS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          className={`btn btn-xs ${dashSection === 'depts' ? 'btn-g' : 'btn-o'}`}
          onClick={() => setDashSection('depts')}
        >
          🏢 Department Compliance Rankings
        </button>
        <button
          className={`btn btn-xs ${dashSection === 'auditors' ? 'btn-g' : 'btn-o'}`}
          onClick={() => setDashSection('auditors')}
        >
          👨‍💼 Auditor Performance Metrics
        </button>
        <button
          className={`btn btn-xs ${dashSection === 'spocs' ? 'btn-g' : 'btn-o'}`}
          onClick={() => setDashSection('spocs')}
        >
          🏢 Department SLA Metrics
        </button>
      </div>

      {/* Zone Breakdown Cards */}
      {dashSection === 'depts' && (
        <div id="zone-wrap">
          {(zoneFilter ? zones.filter(z => z.name === zoneFilter) : zones).map(zone => {
            const zoneAudits = filteredAudits.filter(a => a.zone === zone.name);
            const znc = zoneAudits.reduce((s, a) => s + (a.ncCount || 0), 0);
            const zobs = zoneAudits.reduce((s, a) => s + (a.obsCount || 0), 0);
            const zavg = zoneAudits.length
              ? Math.round(zoneAudits.reduce((s, a) => s + parseInt(a.compliancePct || '0', 10), 0) / zoneAudits.length)
              : 0;

            const deptRefs = Array.from(new Set(zoneAudits.map(a => a.ref)));

            return (
              <div key={zone.name} className="zone-card">
                <div className={`zone-hdr ${zone.cls}`}>
                  <div className="zn">📍 {zone.name} Zone</div>
                  <div className="zs">
                    <div className="zsi">
                      <div className="zsn">{zoneAudits.length}</div>
                      <div className="zsl">Audits</div>
                    </div>
                    <div className="zsi">
                      <div className="zsn">{znc}</div>
                      <div className="zsl">NCs</div>
                    </div>
                    <div className="zsi">
                      <div className="zsn">{zobs}</div>
                      <div className="zsl">Obs</div>
                    </div>
                    <div className="zsi">
                      <div className="zsn">{zavg}%</div>
                      <div className="zsl">Avg Compliance</div>
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <div className="drow drow-hdr" style={{ fontSize: '10px', minWidth: '780px' }}>
                    <div>Ref</div>
                    <div>Function</div>
                    <div>Compliance</div>
                    <div style={{ textAlign: 'center' }}>Audits</div>
                    <div style={{ textAlign: 'center' }}>NC</div>
                    <div style={{ textAlign: 'center' }}>Obs</div>
                    <div style={{ textAlign: 'center' }}>Risk</div>
                    <div style={{ textAlign: 'center' }}>CI</div>
                    <div style={{ textAlign: 'center' }}>Open</div>
                    <div style={{ textAlign: 'center' }}>Closed</div>
                  </div>

                  {deptRefs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '14px', color: 'var(--muted)', fontSize: '12px' }}>
                      No audits conducted in {zone.name} yet.
                    </div>
                  ) : (
                    deptRefs.map(ref => {
                      const da = zoneAudits.filter(a => a.ref === ref);
                      const deptObj = depts.find(d => d.ref === ref) || { fn: '—' };
                      const dnc = da.reduce((s, a) => s + (a.ncCount || 0), 0);
                      const dobs = da.reduce((s, a) => s + (a.obsCount || 0), 0);
                      const drisk = da.reduce((s, a) => s + (a.riskCount || 0), 0);
                      const dci = da.reduce((s, a) => s + (a.ciCount || 0), 0);
                      const dpct = da.length
                        ? Math.round(da.reduce((s, a) => s + parseInt(a.compliancePct || '0', 10), 0) / da.length)
                        : 0;
                      const pclass = dpct >= 80 ? 'pg' : dpct >= 60 ? 'py' : 'pr';

                      const dtasks = tasks.filter(t => da.some(a => a.auditId === t.auditId));
                      const dopen = dtasks.filter(t => ['Notified', 'Response Pending', 'Delayed'].includes(t.status)).length;
                      const dclose = dtasks.filter(t => t.status === 'Closed').length;

                      return (
                        <div key={ref} className="drow" style={{ minWidth: '780px' }}>
                          <div>
                            <span className="badge bk" style={{ fontSize: '10px' }}>
                              {ref}
                            </span>
                          </div>
                          <div style={{ fontWeight: 500, fontSize: '11.5px' }}>{deptObj.fn}</div>
                          <div>
                            <div className="pbar-wrap">
                              <div className={`pbar ${pclass}`} style={{ width: `${dpct}%` }} />
                            </div>
                            <div style={{ fontSize: '9.5px', color: 'var(--muted)', marginTop: '2px' }}>{dpct}%</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>{da.length}</div>
                          <div style={{ textAlign: 'center' }}>{dnc}</div>
                          <div style={{ textAlign: 'center' }}>{dobs}</div>
                          <div style={{ textAlign: 'center' }}>{drisk}</div>
                          <div style={{ textAlign: 'center' }}>{dci}</div>
                          <div style={{ textAlign: 'center' }}>
                            <span className="badge br">{dopen} Open</span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span className="badge bg">{dclose} Closed</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dashSection === 'auditors' && (
        <div className="card" style={{ marginBottom: '18px' }}>
          <div className="ctitle">👨‍💼 Auditor Performance Metrics</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-100)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 12px' }}>Auditor Name</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Audits Conducted</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Avg Compliance Score %</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Scheduled Plans</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Completed Plans</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {auditorStats.map(aud => {
                  const rate = (aud.completed + aud.scheduled) > 0
                    ? Math.round((aud.completed / (aud.completed + aud.scheduled)) * 100)
                    : 100;
                  return (
                    <tr key={aud.name} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{aud.name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}><span className="badge bb">{aud.totalAudits}</span></td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span className={`badge ${aud.avgCompliance >= 80 ? 'bg' : aud.avgCompliance >= 60 ? 'by' : 'br'}`}>
                          {aud.avgCompliance}%
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{aud.scheduled}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{aud.completed}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <strong style={{ color: rate >= 80 ? 'var(--green)' : 'var(--amber)' }}>{rate}%</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dashSection === 'spocs' && (
        <div className="card" style={{ marginBottom: '18px' }}>
          <div className="ctitle">🏢 Department SLA Resolution Performance</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-100)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 12px' }}>Department &amp; Function</th>
                  <th style={{ padding: '8px 12px' }}>SPOC Email</th>
                  <th style={{ padding: '8px 12px' }}>HOD Email</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Dispatched Findings</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Closed On Time</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>SLA Overdue Breaches</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {deptMetricsStats.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <strong>{item.fn}</strong> ({item.dept})
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--muted)' }}>{item.spocMail}</td>
                    <td style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--muted)' }}>{item.hodMail}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}><span className="badge bb">{item.totalDispatches}</span></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}><span className="badge bg">{item.closedOnTime}</span></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span className={`badge ${item.overdueBreached > 0 ? 'br' : 'bm'}`}>
                        {item.overdueBreached}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {item.overdueBreached > 0 ? (
                        <span className="tat tover">ESCALATED TO HOD</span>
                      ) : (
                        <span className="badge bg">On Track</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="fg c2" style={{ gap: '13px' }}>
        <div className="card">
          <div className="ctitle">🔔 TAT Alerts</div>
          <div id="dash-alerts">
            {overdueTasksList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)', fontSize: '12.5px' }}>
                No overdue tasks ✓
              </div>
            ) : (
              overdueTasksList.map(t => (
                <div
                  key={t.taskId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 0',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <span className="tat tover">⚠ OVERDUE</span> <strong>{t.fn}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    Due: {new Date(t.dueAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="ctitle">📅 Recent Planner Activity</div>
          <div id="dash-plans">
            {recentPlans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)', fontSize: '12.5px' }}>
                No plans yet.
              </div>
            ) : (
              recentPlans.map(p => (
                <div
                  key={p.planId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <strong>{p.fn}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--muted)' }}>{p.month}</span>
                    <span
                      className={`badge ${
                        p.status === 'COMPLETED' ? 'bg' : p.status === 'NOT COMPLETED' ? 'br' : 'bm'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
