import React, { useState, useEffect } from 'react';
import { Department, User, Finding, FindingType, AuditReport, SystemSettings, PlanItem } from '../types';
import { getZoneDeptContacts } from '../data/departmentsData';
import * as XLSX from 'xlsx';
import { CheckCircle2, AlertTriangle, Eye, ShieldAlert, Sparkles, Plus, Trash2, Calendar, Download, Printer, RotateCcw, Check } from 'lucide-react';

interface AuditFormViewProps {
  currentUser?: User | null;
  user?: User | null;
  depts: Department[];
  plans?: PlanItem[];
  initialPlan?: PlanItem | null;
  settings: SystemSettings | null;
  onSubmitAudit: (audit: Partial<AuditReport>) => Promise<AuditReport>;
  onToast: (msg: string) => void;
}

export const AuditFormView: React.FC<AuditFormViewProps> = ({
  currentUser,
  user: userProp,
  depts,
  plans = [],
  initialPlan = null,
  settings,
  onSubmitAudit,
  onToast
}) => {
  const user = currentUser || userProp || { name: 'Auditor', role: 'auditor', zone: '' };
  const today = new Date().toISOString().split('T')[0];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlan?.planId || '');
  const [auditDate, setAuditDate] = useState(today);
  const [reportDate, setReportDate] = useState(today);
  const [ref, setRef] = useState(initialPlan?.ref || '');
  const [dept, setDept] = useState(initialPlan?.dept || '');
  const [fn, setFn] = useState(initialPlan?.fn || '');
  const [zone, setZone] = useState<string>(initialPlan ? (user?.zone || 'Chennai') : (user?.zone || ''));
  const [auditor, setAuditor] = useState(initialPlan?.auditor || (user?.role === 'auditor' ? user.name : (user?.name || '')));
  const [auditType, setAuditType] = useState('Process Audit');
  const [auditee, setAuditee] = useState('');
  const [hod, setHod] = useState('');
  const [spocMail, setSpocMail] = useState(initialPlan?.spocMail || '');
  const [hodMail, setHodMail] = useState(initialPlan?.hodMail || '');
  const [scope, setScope] = useState('');
  const [paramsCount, setParamsCount] = useState('');
  const [samplingCount, setSamplingCount] = useState('');
  const [prevRef, setPrevRef] = useState('');

  // Automatically update contacts when ref or zone changes
  useEffect(() => {
    if (ref) {
      const contacts = getZoneDeptContacts(ref, zone, depts);
      setSpocMail(contacts.spocMail);
      setHodMail(contacts.hodMail);
      if (contacts.hodName) setHod(contacts.hodName);
      else if (contacts.hodMail) setHod(contacts.hodMail.split('@')[0]);
    }
  }, [ref, zone, depts]);

  // Pre-fill when initialPlan or selected plan changes
  const applyPlanData = (p: PlanItem) => {
    setSelectedPlanId(p.planId || '');
    setRef(p.ref);
    setDept(p.dept);
    setFn(p.fn);
    if (p.auditor) setAuditor(p.auditor);
    const targetZone = user?.zone || 'Chennai';
    setZone(targetZone);

    const contacts = getZoneDeptContacts(p.ref, targetZone, depts);
    setSpocMail(p.spocMail || contacts.spocMail);
    setHodMail(p.hodMail || contacts.hodMail);
    if (contacts.hodName) setHod(contacts.hodName);

    onToast(`Pre-filled audit form for ${p.ref} - ${p.fn}`);
  };

  useEffect(() => {
    if (initialPlan) {
      applyPlanData(initialPlan);
    }
  }, [initialPlan]);

  // Handle plan selection dropdown
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    const p = plans.find(item => item.planId === planId);
    if (p) {
      applyPlanData(p);
    }
  };

  // MOM
  const [momDate, setMomDate] = useState(today);
  const [agenda, setAgenda] = useState('');
  const [riskNotes, setRiskNotes] = useState('');

  // Findings
  const [curFT, setCurFT] = useState<FindingType>('t1');
  const [riskSubType, setRiskSubType] = useState('Process risk');
  const [findings, setFindings] = useState<Finding[]>([]);

  // Scoring params
  const initialParams = settings?.params || [
    { id: 'P1', title: 'Process Documentation', max: 10 },
    { id: 'P2', title: 'Process Adherence', max: 10 },
    { id: 'P3', title: 'Quality Control', max: 10 },
    { id: 'P4', title: 'Risk Management', max: 10 },
    { id: 'P5', title: 'Training & Competency', max: 10 },
    { id: 'P6', title: 'Corrective Action', max: 10 },
    { id: 'P7', title: 'Continuous Improvement', max: 10 }
  ];

  const [scores, setScores] = useState<Record<string, { max: number; actual: number; remarks: string }>>(() => {
    const init: Record<string, { max: number; actual: number; remarks: string }> = {};
    initialParams.forEach(p => {
      init[p.id] = { max: p.max, actual: 0, remarks: '' };
    });
    return init;
  });

  const [schPts, setSchPts] = useState(100);
  const [ncPts, setNcPts] = useState(0);
  const [rmPts, setRmPts] = useState(0);

  // Closure
  const [closureDate, setClosureDate] = useState(today);
  const [closureSpoc, setClosureSpoc] = useState('');
  const [closureSummary, setClosureSummary] = useState('');
  const [closureResponse, setClosureResponse] = useState('');
  const [auditorSign, setAuditorSign] = useState('');
  const [hodApproval, setHodApproval] = useState('');

  // Prepared / Approved
  const [preparedBy, setPreparedBy] = useState(user.name);
  const [approvedBy, setApprovedBy] = useState('');

  // Auto handle department selection
  const handleRefChange = (newRef: string) => {
    setRef(newRef);
    const found = depts.find(d => d.ref === newRef);
    if (found) {
      setDept(found.dept);
      setFn(found.fn);
      const contacts = getZoneDeptContacts(newRef, zone, depts);
      setSpocMail(contacts.spocMail);
      setHodMail(contacts.hodMail);
      setHod(contacts.hodName || (contacts.hodMail ? contacts.hodMail.split('@')[0] : ''));
      setAuditee(contacts.spocName || (contacts.spocMail ? contacts.spocMail.split('@')[0] : ''));
    } else {
      setDept('');
      setFn('');
      setHod('');
      setSpocMail('');
      setHodMail('');
      setAuditee('');
    }
  };

  const handleZoneChange = (newZone: string) => {
    setZone(newZone);
    if (ref) {
      const contacts = getZoneDeptContacts(ref, newZone, depts);
      setSpocMail(contacts.spocMail);
      setHodMail(contacts.hodMail);
      setHod(contacts.hodName || (contacts.hodMail ? contacts.hodMail.split('@')[0] : ''));
      setAuditee(contacts.spocName || (contacts.spocMail ? contacts.spocMail.split('@')[0] : ''));
    }
  };

  // Available auditors by zone
  const getAvailableAuditors = () => {
    if (!settings?.auditors) return [user.name];
    if (zone && settings.auditors[zone as keyof typeof settings.auditors]) {
      return settings.auditors[zone as keyof typeof settings.auditors].filter(Boolean);
    }
    return [
      ...(settings.auditors.Chennai || []),
      ...(settings.auditors.Coimbatore || []),
      ...(settings.auditors.Bangalore || [])
    ].filter(Boolean);
  };

  // Add finding
  const addFinding = () => {
    const newF: Finding = {
      id: 'f_' + Date.now() + Math.random().toString(36).substring(2, 6),
      type: curFT,
      subtype: curFT === 't3' ? riskSubType : undefined,
      process: '',
      description: '',
      evidence: '',
      imm: '',
      rc: '',
      capa: '',
      mitigation: '',
      dueDate: '',
      responsible: '',
      status: 'Open'
    };
    setFindings(prev => [...prev, newF]);
  };

  const removeFinding = (id: string) => {
    setFindings(prev => prev.filter(f => f.id !== id));
  };

  const updateFindingField = (id: string, key: keyof Finding, value: string) => {
    setFindings(prev => prev.map(f => (f.id === id ? { ...f, [key]: value } : f)));
  };

  // Calculate scores
  let maxTotal = 0;
  let actTotal = 0;
  Object.values(scores).forEach((s: { max: number; actual: number; remarks: string }) => {
    maxTotal += Number(s.max) || 0;
    actTotal += Math.min(Number(s.actual) || 0, Number(s.max) || 0);
  });
  const compliancePctVal = maxTotal > 0 ? Math.round((actTotal / maxTotal) * 100) : 0;
  const compliancePctStr = `${compliancePctVal}%`;

  const processScoreTotal = Math.round(
    Math.min(schPts, 100) +
    Math.min(compliancePctVal * 4, 400) +
    Math.min(ncPts, 250) +
    Math.min(rmPts, 250)
  );

  const resetForm = () => {
    setRef('');
    setDept('');
    setFn('');
    setZone(user.zone || '');
    setAuditor(user.role === 'auditor' ? user.name : '');
    setAuditee('');
    setHod('');
    setScope('');
    setParamsCount('');
    setSamplingCount('');
    setPrevRef('');
    setAgenda('');
    setRiskNotes('');
    setFindings([]);
    setClosureSpoc('');
    setClosureSummary('');
    setClosureResponse('');
    setAuditorSign('');
    setHodApproval('');
    setApprovedBy('');
    onToast('Form reset');
  };

  const handleSubmit = async () => {
    if (!ref) {
      onToast('Please select a Department Ref');
      return;
    }
    if (!auditDate) {
      onToast('Please enter Audit Date');
      return;
    }
    if (!auditor) {
      onToast('Please select an Auditor');
      return;
    }

    const payload: Partial<AuditReport> = {
      planId: selectedPlanId,
      auditDate,
      reportDate,
      ref,
      dept,
      fn,
      zone: (zone as any) || '',
      auditor,
      auditType,
      auditee,
      hod,
      scope,
      params: paramsCount,
      sampling: samplingCount,
      prevRef,
      momDate,
      agenda,
      riskNotes,
      findings,
      compliancePct: compliancePctStr,
      processScore: processScoreTotal,
      ncCount: findings.filter(f => f.type === 't4').length,
      obsCount: findings.filter(f => f.type === 't2').length,
      riskCount: findings.filter(f => f.type === 't3').length,
      ciCount: findings.filter(f => f.type === 't1').length,
      closureDate,
      closureSpoc,
      closureSummary,
      closureResponse,
      auditorSign,
      hodApproval,
      preparedBy: preparedBy || user.name,
      approvedBy,
      status: 'Submitted'
    };

    try {
      const res = await onSubmitAudit(payload);
      onToast(`Audit report ${res.auditId} submitted! Go to Dispatch to send to department.`);
      resetForm();
    } catch (err: any) {
      onToast(`Error submitting audit: ${err.message}`);
    }
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    const sum = [
      ['', 'CASAGRAND — PROCESS AUDIT REPORT'],
      [''],
      ['Audit Date', auditDate],
      ['Report Date', reportDate],
      ['Zone', zone || '—'],
      ['Department', dept || '—'],
      ['Function', fn || '—'],
      ['Auditor', auditor || '—'],
      ['Audit Type', auditType || '—'],
      ['Auditee', auditee || '—'],
      ['HOD', hod || '—'],
      ['Compliance %', compliancePctStr],
      ['Process Score', `${processScoreTotal}/1000`],
      ['NC Count', findings.filter(f => f.type === 't4').length],
      ['Observations', findings.filter(f => f.type === 't2').length],
      ['Risks', findings.filter(f => f.type === 't3').length],
      ['CI / No Finding', findings.filter(f => f.type === 't1').length]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(sum);
    XLSX.utils.book_append_sheet(wb, ws1, 'Audit Summary');

    const fh = ['#', 'Type', 'Risk Subtype', 'Process', 'Description', 'Evidence', 'Immediate Action / Mitigation', 'Root Cause', 'CAPA', 'Due Date', 'Responsible'];
    const fd = findings.map((f, i) => [
      i + 1,
      f.type === 't1' ? 'Continuous Improvement (CI)' : f.type === 't2' ? 'Observation' : f.type === 't3' ? `Process Risk (${f.subtype || 'Process'})` : 'Non-Compliance (NC)',
      f.subtype || '—',
      f.process || '—',
      f.description || '—',
      f.evidence || '—',
      f.imm || f.mitigation || '—',
      f.rc || '—',
      f.capa || '—',
      f.dueDate || '—',
      f.responsible || '—'
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([fh, ...fd]);
    XLSX.utils.book_append_sheet(wb, ws2, 'Findings');

    XLSX.writeFile(wb, `Audit_Report_${ref}_${auditDate}.xlsx`);
    onToast('Excel report downloaded');
  };

  const previewPrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const rows = findings
      .map(
        (f, i) => `<tr>
      <td>${i + 1}</td>
      <td><strong>${f.type === 't1' ? 'Continuous Improvement' : f.type === 't2' ? 'Observation' : f.type === 't3' ? `Process Risk (${f.subtype || 'Process'})` : 'Non-Compliance (NC)'}</strong></td>
      <td>${f.process || '—'}</td>
      <td>${f.description || '—'}</td>
      <td>${f.evidence || '—'}</td>
      <td>${f.imm || f.mitigation || '—'}</td>
      <td>${f.rc || '—'}</td>
      <td>${f.capa || '—'}</td>
    </tr>`
      )
      .join('');

    w.document.write(`<!DOCTYPE html><html><head><title>Audit Preview</title><style>body{font-family:Arial;padding:28px;max-width:1000px;margin:auto;font-size:12px;}h1{color:#c8401a;border-bottom:2px solid #c8401a;padding-bottom:8px;}table{width:100%;border-collapse:collapse;margin:14px 0;}th{background:#0f1117;color:#fff;padding:6px 8px;text-align:left;}td{padding:6px 8px;border:1px solid #ddd;}tr:nth-child(even){background:#f9f9f9;}@media print{button{display:none;}}</style></head><body>
      <h1>Process Audit Report Preview</h1>
      <p>Department: <strong>${dept || '—'}</strong> &nbsp;|&nbsp; Function: <strong>${fn || '—'}</strong></p>
      <p>Auditor: <strong>${auditor || '—'}</strong> &nbsp;|&nbsp; Date: <strong>${auditDate}</strong> &nbsp;|&nbsp; Zone: <strong>${zone || '—'}</strong></p>
      <p>Compliance: <strong style="color:#c8401a;font-size:16px;">${compliancePctStr}</strong> &nbsp;|&nbsp; Process Score: <strong style="color:#c8401a;font-size:16px;">${processScoreTotal}/1000</strong></p>
      <h2>Findings (${findings.length})</h2>
      <table><thead><tr><th>#</th><th>Type</th><th>Process</th><th>Description</th><th>Evidence</th><th>Immediate Action</th><th>Root Cause</th><th>CAPA</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="margin-top:22px;font-size:10px;color:#999;">Generated: ${new Date().toLocaleString()} · ProcessAudit v4 · Casagrand P&C</p>
      <button onclick="window.print()" style="padding:8px 18px;background:#c8401a;color:#fff;border:none;border-radius:6px;cursor:pointer;">Print / Save PDF</button>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            Audit <em>Report Form</em>
          </div>
          <div className="ps">
            Auditor: {user.name} {user.zone ? `— ${user.zone}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <button className="btn btn-o btn-sm" onClick={resetForm} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <button className="btn btn-r" onClick={handleSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Check size={14} />
            <span>Submit Report</span>
          </button>
        </div>
      </div>

      {/* Optional: Link Scheduled Plan */}
      {plans.length > 0 && (
        <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--border)' }}>
          <div className="ctitle" style={{ fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: 'var(--red)' }} />
            <span>Link Scheduled Audit Plan (Optional)</span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedPlanId}
              onChange={e => handlePlanSelect(e.target.value)}
              style={{ flex: 1, padding: '7px 12px', fontSize: '12px', borderRadius: '6px' }}
            >
              <option value="">— Select an Upcoming Plan to Pre-Fill —</option>
              {plans
                .filter(p => p.status !== 'COMPLETED')
                .map(p => (
                  <option key={p.planId} value={p.planId}>
                    {p.planId} | {p.month} — {p.ref} {p.fn} ({p.dept}) [Auditor: {p.auditor || 'Unassigned'}]
                  </option>
                ))}
            </select>
            {selectedPlanId && (
              <span className="badge bg" style={{ padding: '6px 12px' }}>
                ✓ Linked to Plan #{selectedPlanId}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Section 1: Summary */}
      <div className="card">
        <div className="ctitle">
          <span>
            <span className="sn">1</span> Audit Summary
          </span>
        </div>
        <div className="fg c3">
          <div className="field">
            <label>Audit Date *</label>
            <input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Report Date</label>
            <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Department Ref *</label>
            <select value={ref} onChange={e => handleRefChange(e.target.value)}>
              <option value="">— Select Ref —</option>
              {depts.map(d => (
                <option key={d.ref} value={d.ref}>
                  {d.ref} — {d.fn}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Department</label>
            <input value={dept} readOnly />
          </div>
          <div className="field">
            <label>Function</label>
            <input value={fn} readOnly />
          </div>
          <div className="field">
            <label>Zone *</label>
            <select value={zone} onChange={e => handleZoneChange(e.target.value)}>
              <option value="">— Zone —</option>
              <option>Chennai</option>
              <option>Coimbatore</option>
              <option>Bangalore</option>
            </select>
          </div>
          <div className="field">
            <label>Auditor *</label>
            <select value={auditor} onChange={e => setAuditor(e.target.value)}>
              <option value="">— Select —</option>
              {getAvailableAuditors().map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Audit Type</label>
            <select value={auditType} onChange={e => setAuditType(e.target.value)}>
              <option>Process Audit</option>
              <option>Product Audit</option>
              <option>System Audit</option>
              <option>Re-Audit</option>
            </select>
          </div>
          <div className="field">
            <label>Auditee *</label>
            <input value={auditee} onChange={e => setAuditee(e.target.value)} placeholder="Name of auditee" />
          </div>
          <div className="field">
            <label>SPOC Email *</label>
            <input type="email" value={spocMail} onChange={e => setSpocMail(e.target.value)} placeholder="SPOC email address" required />
          </div>
          <div className="field">
            <label>HOD Name &amp; Email *</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={hod} onChange={e => setHod(e.target.value)} placeholder="HOD Name" style={{ flex: 1 }} />
              <input type="email" value={hodMail} onChange={e => setHodMail(e.target.value)} placeholder="HOD email" style={{ flex: 1 }} required />
            </div>
          </div>
          <div className="field">
            <label>Scope</label>
            <input value={scope} onChange={e => setScope(e.target.value)} placeholder="Audit scope" />
          </div>
          <div className="field">
            <label>No. of Parameters</label>
            <input type="number" value={paramsCount} onChange={e => setParamsCount(e.target.value)} min="0" />
          </div>
          <div className="field">
            <label>No. of Sampling</label>
            <input type="number" value={samplingCount} onChange={e => setSamplingCount(e.target.value)} min="0" />
          </div>
          <div className="field">
            <label>Prev Audit Ref</label>
            <input value={prevRef} onChange={e => setPrevRef(e.target.value)} placeholder="If Re-Audit" />
          </div>
        </div>
      </div>

      {/* Section 2: Opening MOM */}
      <div className="card">
        <div className="ctitle">
          <span className="sn">2</span> Opening MOM
        </div>
        <div className="fg c2">
          <div className="field">
            <label>MOM Date</label>
            <input type="date" value={momDate} onChange={e => setMomDate(e.target.value)} />
          </div>
          <div className="field span2">
            <label>Agenda / Discussion Points</label>
            <textarea value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="Opening meeting agenda..." />
          </div>
          <div className="field span2">
            <label>Risk Notes from Previous Cycle</label>
            <textarea value={riskNotes} onChange={e => setRiskNotes(e.target.value)} placeholder="Carry-forward risk notes..." />
          </div>
        </div>
      </div>

      {/* Section 3: Findings Entry */}
      <div className="card">
        <div className="ctitle">
          <span className="sn">3</span> Findings Entry
        </div>
        <div className="ftabs">
          <div
            className={`ftab t1 ${curFT === 't1' ? 'on' : ''}`}
            onClick={() => setCurFT('t1')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <CheckCircle2 size={14} />
            <span>Continuous Improvement (CI)</span>
          </div>
          <div
            className={`ftab t2 ${curFT === 't2' ? 'on' : ''}`}
            onClick={() => setCurFT('t2')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={14} />
            <span>Observation</span>
          </div>
          <div
            className={`ftab t3 ${curFT === 't3' ? 'on' : ''}`}
            onClick={() => setCurFT('t3')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <AlertTriangle size={14} />
            <span>Process Risk</span>
          </div>
          <div
            className={`ftab t4 ${curFT === 't4' ? 'on' : ''}`}
            onClick={() => setCurFT('t4')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={14} />
            <span>Non-Compliance (NC)</span>
          </div>
        </div>

        <div className="alert ai" style={{ fontSize: '12px' }}>
          {curFT === 't1' && 'Continuous Improvement — Good practice or positive observation. No corrective action required from SPOC.'}
          {curFT === 't2' && 'Observation — Minor process deviation. SPOC must submit Immediate Correction + Root Cause + CAPA within 72 hours.'}
          {curFT === 't3' && 'Process Risk (Financial / Compliance / Process). SPOC must submit a Mitigation Plan within 72 hours.'}
          {curFT === 't4' && 'Non-Compliance (NC) — Severe process breach. SPOC must submit Immediate Correction + Root Cause + CAPA. Escalation triggered if overdue.'}
        </div>

        {curFT === 't3' && (
          <div style={{ marginBottom: '10px' }}>
            <div className="field" style={{ maxWidth: '280px' }}>
              <label>Risk Sub-type</label>
              <select value={riskSubType} onChange={e => setRiskSubType(e.target.value)}>
                <option value="Financial risk">Financial Risk</option>
                <option value="Compliance risk">Compliance Risk</option>
                <option value="Process risk">Process Risk</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '9px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span className="badge bg">CI:{findings.filter(f => f.type === 't1').length}</span>
            <span className="badge by">Obs:{findings.filter(f => f.type === 't2').length}</span>
            <span className="badge bo">Risk:{findings.filter(f => f.type === 't3').length}</span>
            <span className="badge br">NC:{findings.filter(f => f.type === 't4').length}</span>
          </div>
          <button className="btn btn-b btn-sm" onClick={addFinding} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} />
            <span>Add Finding Row</span>
          </button>
        </div>

        {findings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--muted)', fontSize: '12.5px' }}>
            No findings added. Select a type above and click + Add Finding Row.
          </div>
        ) : (
          findings.map(f => (
            <div key={f.id} className={`fc ${f.type}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className={`badge ${f.type === 't1' ? 'bg' : f.type === 't2' ? 'by' : f.type === 't3' ? 'bo' : 'br'}`}>
                  {f.type === 't1' ? 'CI / No Finding' : f.type === 't2' ? 'Observation' : f.type === 't3' ? `Risk (${f.subtype || 'Process'})` : 'NC'}
                </span>
                <button className="btn btn-xs btn-o" onClick={() => removeFinding(f.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Trash2 size={11} />
                  <span>Remove</span>
                </button>
              </div>

              <div className="fg c3">
                <div className="field">
                  <label>Process / Clause</label>
                  <input
                    value={f.process || ''}
                    onChange={e => updateFindingField(f.id, 'process', e.target.value)}
                    placeholder="Process area"
                  />
                </div>
                <div className="field span2">
                  <label>Finding Description *</label>
                  <input
                    value={f.description}
                    onChange={e => updateFindingField(f.id, 'description', e.target.value)}
                    placeholder="Describe the finding in detail"
                  />
                </div>
                <div className="field">
                  <label>Evidence / Reference</label>
                  <input
                    value={f.evidence || ''}
                    onChange={e => updateFindingField(f.id, 'evidence', e.target.value)}
                    placeholder="Document / record ref"
                  />
                </div>
                <div className="field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={f.dueDate || ''}
                    onChange={e => updateFindingField(f.id, 'dueDate', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Responsible</label>
                  <input
                    value={f.responsible || ''}
                    onChange={e => updateFindingField(f.id, 'responsible', e.target.value)}
                    placeholder="Owner name"
                  />
                </div>
              </div>

              {(f.type === 't2' || f.type === 't4') && (
                <div className="fg c3" style={{ marginTop: '8px' }}>
                  <div className="field">
                    <label>Immediate Correction</label>
                    <input
                      value={f.imm || ''}
                      onChange={e => updateFindingField(f.id, 'imm', e.target.value)}
                      placeholder="Immediate action taken"
                    />
                  </div>
                  <div className="field">
                    <label>Root Cause</label>
                    <input
                      value={f.rc || ''}
                      onChange={e => updateFindingField(f.id, 'rc', e.target.value)}
                      placeholder="Why did this happen?"
                    />
                  </div>
                  <div className="field">
                    <label>CAPA</label>
                    <input
                      value={f.capa || ''}
                      onChange={e => updateFindingField(f.id, 'capa', e.target.value)}
                      placeholder="Preventive action"
                    />
                  </div>
                </div>
              )}

              {f.type === 't3' && (
                <div className="fg c2" style={{ marginTop: '8px' }}>
                  <div className="field">
                    <label>Risk Sub-type</label>
                    <input value={f.subtype || 'Process risk'} readOnly />
                  </div>
                  <div className="field">
                    <label>Mitigation Plan</label>
                    <input
                      value={f.mitigation || ''}
                      onChange={e => updateFindingField(f.id, 'mitigation', e.target.value)}
                      placeholder="Risk mitigation plan"
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Section 4: Compliance Scoring */}
      <div className="card">
        <div className="ctitle">
          <span className="sn">4</span> Compliance Scoring
        </div>
        <div className="alert ai" style={{ fontSize: '12px' }}>
          Compliance % = (Actual ÷ Max) × 100 &nbsp;|&nbsp; Process Score = Schedule(100) + Compliance×4(400) + NC Closure(250) + Risk Mitigation(250) = 1000 pts
        </div>

        <table style={{ marginBottom: '13px' }}>
          <thead>
            <tr>
              <th>Param</th>
              <th>Process Title</th>
              <th>Max Score</th>
              <th>Actual Score</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {initialParams.map(p => {
              const currentScore = scores[p.id] || { max: p.max, actual: 0, remarks: '' };
              return (
                <tr key={p.id}>
                  <td>
                    <span className="badge bk">{p.id}</span>
                  </td>
                  <td>{p.title}</td>
                  <td>
                    <input
                      type="number"
                      value={currentScore.max}
                      onChange={e =>
                        setScores(prev => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], max: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      style={{ width: '60px', textAlign: 'center', padding: '4px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={currentScore.actual}
                      onChange={e =>
                        setScores(prev => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], actual: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      style={{ width: '60px', textAlign: 'center', padding: '4px' }}
                    />
                  </td>
                  <td>
                    <input
                      value={currentScore.remarks}
                      onChange={e =>
                        setScores(prev => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], remarks: e.target.value }
                        }))
                      }
                      placeholder="Remarks"
                      style={{ fontSize: '11px', padding: '4px 7px' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--surface2)' }}>
              <td colSpan={2} style={{ padding: '7px 10px', fontWeight: 700 }}>
                Total
              </td>
              <td style={{ padding: '7px 10px', fontWeight: 700 }}>{maxTotal}</td>
              <td style={{ padding: '7px 10px', fontWeight: 700, color: 'var(--red)' }}>{actTotal}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        <div className="fg c4" style={{ marginBottom: '11px' }}>
          <div className="field">
            <label>Compliance %</label>
            <input
              value={compliancePctStr}
              readOnly
              style={{ fontWeight: 700, fontSize: '15px', color: 'var(--red)', textAlign: 'center' }}
            />
          </div>
          <div className="field">
            <label>Schedule Adh — A (max 100)</label>
            <input type="number" value={schPts} onChange={e => setSchPts(parseFloat(e.target.value) || 0)} min="0" max="100" />
          </div>
          <div className="field">
            <label>NC Closure pts — C (max 250)</label>
            <input type="number" value={ncPts} onChange={e => setNcPts(parseFloat(e.target.value) || 0)} min="0" max="250" />
          </div>
          <div className="field">
            <label>Risk Mit pts — D (max 250)</label>
            <input type="number" value={rmPts} onChange={e => setRmPts(parseFloat(e.target.value) || 0)} min="0" max="250" />
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            Process Evaluation Score / 1000
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, background: 'var(--border)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg,#ef4444,var(--red))',
                  borderRadius: '10px',
                  width: `${(processScoreTotal / 10)}%`,
                  transition: 'width .5s'
                }}
              />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--red)', whiteSpace: 'nowrap' }}>
              {processScoreTotal}/1000
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Closure MOM */}
      <div className="card">
        <div className="ctitle">
          <span className="sn">5</span> Closure MOM
        </div>
        <div className="fg c2">
          <div className="field">
            <label>Closure Date</label>
            <input type="date" value={closureDate} onChange={e => setClosureDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Auditee SPOC</label>
            <input value={closureSpoc} onChange={e => setClosureSpoc(e.target.value)} placeholder="SPOC name" />
          </div>
          <div className="field span2">
            <label>Closure Summary</label>
            <textarea value={closureSummary} onChange={e => setClosureSummary(e.target.value)} placeholder="Findings discussed and agreed actions..." />
          </div>
          <div className="field span2">
            <label>Auditee Response / Agreed Actions</label>
            <textarea value={closureResponse} onChange={e => setClosureResponse(e.target.value)} placeholder="Auditee acknowledgement..." />
          </div>
          <div className="field">
            <label>Auditor Sign</label>
            <input value={auditorSign} onChange={e => setAuditorSign(e.target.value)} placeholder="Name + date" />
          </div>
          <div className="field">
            <label>HOD Approval</label>
            <input value={hodApproval} onChange={e => setHodApproval(e.target.value)} placeholder="Name + date" />
          </div>
        </div>
      </div>

      {/* Section 6: Submit & Publish */}
      <div className="card" style={{ border: '2px solid var(--border)' }}>
        <div className="ctitle">
          <span className="sn">6</span> Submit &amp; Publish
        </div>
        <div className="alert aw">
          After submit → Admin/Lead must go to Dispatch to send the report to the department and start the 72-hour response clock.
        </div>
        <div className="fg c2">
          <div className="field">
            <label>Prepared By</label>
            <input value={preparedBy} onChange={e => setPreparedBy(e.target.value)} placeholder="Auditor name / designation" />
          </div>
          <div className="field">
            <label>Approved By</label>
            <input value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="Lead name / designation" />
          </div>
        </div>
        <div className="brow">
          <button className="btn btn-r" onClick={handleSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Check size={14} />
            <span>Submit Report</span>
          </button>
          <button className="btn btn-b" onClick={downloadExcel} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Download size={14} />
            <span>Download Excel</span>
          </button>
          <button className="btn btn-o" onClick={previewPrint} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Eye size={14} />
            <span>Preview / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
