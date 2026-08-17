import React, { useState, useEffect } from 'react';
import { PlanItem, AuditReport, Department, User, UserRole, ZoneName, Settings, EmailAttachment } from '../types';
import { getZoneDeptContacts } from '../data/departmentsData';
import { h6 } from '../data/usersData';
import * as XLSX from 'xlsx';
import { Plus, Edit2, X, Send, Paperclip, Check, AlertTriangle, FileText, Upload, Save, CheckCircle2, Star, ChevronDown, ChevronRight, MapPin } from 'lucide-react';

// ---------------------- PLAN MODAL ----------------------
interface PlanModalProps {
  onClose: () => void;
  onSave: (plan: Omit<PlanItem, 'id' | 'createdAt'>) => Promise<void>;
  depts: Department[];
  editingPlan?: PlanItem | null;
  currentUser?: User | null;
}

export const PlanModal: React.FC<PlanModalProps> = ({ onClose, onSave, depts, editingPlan, currentUser }) => {
  const [ref, setRef] = useState(editingPlan?.ref || (depts[0]?.ref || 'A'));
  const [date, setDate] = useState(editingPlan?.planDate || editingPlan?.date || new Date().toISOString().split('T')[0]);
  const [zone, setZone] = useState<ZoneName | string>(editingPlan?.zone || currentUser?.zone || 'Chennai');
  const [auditor, setAuditor] = useState(editingPlan?.auditor || currentUser?.name || 'Prem Anand');
  const [auditee, setAuditee] = useState(editingPlan?.auditee || '');
  const [hod, setHod] = useState(editingPlan?.hod || '');
  const [spocMail, setSpocMail] = useState(editingPlan?.spocMail || '');
  const [hodMail, setHodMail] = useState(editingPlan?.hodMail || '');
  const [notes, setNotes] = useState(editingPlan?.notes || editingPlan?.remarks || '');

  // Auto-fill SPOC & HOD email based on Zone & Dept
  useEffect(() => {
    if (ref && !editingPlan) {
      const contacts = getZoneDeptContacts(ref, zone, depts);
      setSpocMail(contacts.spocMail);
      setHodMail(contacts.hodMail);
      if (contacts.hodName) setHod(contacts.hodName);
      else if (contacts.hodMail) setHod(contacts.hodMail.split('@')[0]);
      if (contacts.spocName) setAuditee(contacts.spocName);
    }
  }, [ref, zone, depts, editingPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = depts.find(x => x.ref === ref);
    
    // Calculate month name from selected date
    const dateObj = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = !isNaN(dateObj.getTime()) ? months[dateObj.getMonth()] : 'August';

    await onSave({
      ...(editingPlan?.planId ? { planId: editingPlan.planId } : {}),
      ref,
      dept: d?.dept || ref,
      fn: d?.fn || ref,
      date,
      planDate: date,
      month,
      zone: (zone as ZoneName) || 'Chennai',
      auditor,
      auditee,
      hod,
      spocMail,
      hodMail,
      notes,
      remarks: notes
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {editingPlan ? <Edit2 size={16} /> : <Plus size={16} />}
            <span>{editingPlan ? 'Edit Audit Plan' : 'Schedule New Audit'}</span>
          </h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Department / Function *</label>
              <select value={ref} onChange={e => setRef(e.target.value)} required>
                {depts.map(d => (
                  <option key={d.ref} value={d.ref}>
                    [{d.ref}] {d.dept} — {d.fn}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Target Zone *</label>
              <select value={zone} onChange={e => setZone(e.target.value as ZoneName)} required>
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Planned Audit Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label>Lead Auditor *</label>
              <input type="text" value={auditor} onChange={e => setAuditor(e.target.value)} required />
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Auditee Name / Role</label>
              <input type="text" value={auditee} onChange={e => setAuditee(e.target.value)} placeholder="e.g. Process SPOC" />
            </div>
            <div className="field">
              <label>HOD Name</label>
              <input type="text" value={hod} onChange={e => setHod(e.target.value)} placeholder="e.g. Dept Head" />
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>SPOC Email (for Dispatch Notifications)</label>
              <input type="email" value={spocMail} onChange={e => setSpocMail(e.target.value)} placeholder="spoc@casagrand.co.in" />
            </div>
            <div className="field">
              <label>HOD Email (for Escalate / CC)</label>
              <input type="email" value={hodMail} onChange={e => setHodMail(e.target.value)} placeholder="hod@casagrand.co.in" />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '16px' }}>
            <label>Notes / Audit Scope Focus</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Key scope areas..." />
          </div>

          <div className="brow">
            <button type="button" className="btn btn-o" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-r" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Save size={14} />
              <span>Save Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------- DISPATCH MODAL ----------------------
interface DispatchModalProps {
  auditId: string;
  audit: AuditReport;
  depts: Department[];
  settings?: Settings;
  onClose: () => void;
  onDispatch: (params: {
    auditId: string;
    spocMail: string;
    hodMail: string;
    smtpServerId?: string;
    includeAttachment?: boolean;
    attachments?: EmailAttachment[];
  }) => Promise<void>;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({ auditId, audit, depts, settings, onClose, onDispatch }) => {
  const contacts = getZoneDeptContacts(audit.ref, audit.zone, depts);
  const [spocMail, setSpocMail] = useState(audit.spocMail || contacts.spocMail);
  const [hodMail, setHodMail] = useState(audit.hodMail || contacts.hodMail);
  const [dispatching, setDispatching] = useState(false);
  const [includeAttachment, setIncludeAttachment] = useState(true);
  const [extraFiles, setExtraFiles] = useState<EmailAttachment[]>([]);

  const smtpServers = settings?.smtpServers || [];
  const activeSmtpId = settings?.activeSmtpServerId || (smtpServers.find(s => s.isDefault)?.id || smtpServers[0]?.id || '');
  const [selectedServerId, setSelectedServerId] = useState<string>(activeSmtpId);

  const selectedServer = smtpServers.find(s => s.id === selectedServerId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Content = (reader.result as string).split(',')[1];
        setExtraFiles(prev => [
          ...prev,
          {
            filename: file.name,
            content: base64Content,
            encoding: 'base64',
            contentType: file.type || 'application/octet-stream'
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!spocMail) {
      alert('Please provide a SPOC email address.');
      return;
    }
    try {
      setDispatching(true);
      await onDispatch({
        auditId,
        spocMail,
        hodMail,
        smtpServerId: selectedServerId || undefined,
        includeAttachment,
        attachments: extraFiles
      });
      onClose();
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={16} />
            <span>Dispatch Audit Findings — {auditId}</span>
          </h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        <div className="alert ai" style={{ marginBottom: '14px', fontSize: '12px' }}>
          This will generate a 72-hour SLA task for <strong>{audit.dept}</strong> and deliver an email notification with one-click SPOC authorization and attached findings report.
        </div>

        {/* OUTGOING SMTP SERVER SELECTOR */}
        {smtpServers.length > 0 && (
          <div style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Outgoing Mail Server:</span>
              <select
                value={selectedServerId}
                onChange={e => setSelectedServerId(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border)', background: '#fff' }}
              >
                {smtpServers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.user || 'No Email'}) {s.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
            {selectedServer?.pass ? (
              <span className="badge bg" style={{ fontSize: '10px' }}>Live SMTP</span>
            ) : (
              <span className="badge by" style={{ fontSize: '10px' }}>Local Queue</span>
            )}
          </div>
        )}

        <div className="field" style={{ marginBottom: '12px' }}>
          <label>Department / Function</label>
          <input type="text" value={`${audit.dept} — ${audit.fn}`} disabled style={{ background: 'var(--surface2)' }} />
        </div>

        <div className="fg c2" style={{ marginBottom: '14px' }}>
          <div className="field">
            <label>SPOC Email *</label>
            <input type="email" value={spocMail} onChange={e => setSpocMail(e.target.value)} required />
          </div>
          <div className="field">
            <label>HOD Email (CC)</label>
            <input type="email" value={hodMail} onChange={e => setHodMail(e.target.value)} />
          </div>
        </div>

        {/* ATTACHMENT OPTIONS */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px' }}>
          <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Paperclip size={13} />
            <span>File Attachments</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={includeAttachment}
              onChange={e => setIncludeAttachment(e.target.checked)}
            />
            <span>Auto-attach Audit Findings Summary File (<code>Audit_Summary_{auditId}.csv</code>)</span>
          </label>

          <div style={{ marginTop: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
              Attach Additional Evidence / Files (Optional):
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ fontSize: '11px', padding: '4px' }}
            />
            {extraFiles.length > 0 && (
              <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {extraFiles.map((f, i) => (
                  <span key={i} className="badge bb" style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Paperclip size={10} />
                    <span>{f.filename}</span>
                    <button
                      type="button"
                      onClick={() => setExtraFiles(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', padding: 0 }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
          <strong>Findings Breakdown to Dispatch:</strong>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span className="badge br">{audit.ncCount} Non-Compliance (NC)</span>
            <span className="badge by">{audit.obsCount} Observation</span>
            <span className="badge bo">{audit.riskCount} Process Risk</span>
            <span className="badge bg">{audit.ciCount} Continuous Improvement (CI)</span>
          </div>
        </div>

        <div className="brow">
          <button type="button" className="btn btn-o" onClick={onClose} disabled={dispatching}>Cancel</button>
          <button type="button" className="btn btn-r" onClick={handleSend} disabled={dispatching} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Send size={14} />
            <span>{dispatching ? 'Sending Notification & Attachments…' : 'Dispatch Now & Deliver Email with File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------- RESPONSE MODAL (Admin entering SPOC response) ----------------------
interface ResponseModalProps {
  auditId: string;
  audit: AuditReport;
  onClose: () => void;
  onSubmitResponseByAuditId: (params: { auditId: string; responses: Record<string, any> }) => Promise<void>;
}

export const ResponseModal: React.FC<ResponseModalProps> = ({ auditId, audit, onClose, onSubmitResponseByAuditId }) => {
  const actionFindings = (audit.findings || []).filter(f => f.type !== 't1');
  const [responses, setResponses] = useState<Record<string, { imm?: string; rc?: string; capa?: string; mitigation?: string }>>({});

  const updateField = (id: string, field: string, val: string) => {
    setResponses(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: val
      }
    }));
  };

  const handleSubmit = async () => {
    let valid = true;
    const finalResp: Record<string, any> = {};

    actionFindings.forEach(f => {
      const cur = responses[f.id] || {};
      if (f.type === 't2' || f.type === 't4') {
        const imm = cur.imm !== undefined ? cur.imm : f.imm || '';
        if (!imm.trim()) valid = false;
        finalResp[f.id] = {
          imm,
          rc: cur.rc !== undefined ? cur.rc : f.rc || '',
          capa: cur.capa !== undefined ? cur.capa : f.capa || ''
        };
      } else if (f.type === 't3') {
        const mit = cur.mitigation !== undefined ? cur.mitigation : f.mitigation || '';
        if (!mit.trim()) valid = false;
        finalResp[f.id] = { mitigation: mit };
      }
    });

    if (!valid) {
      alert('Please fill all required response fields.');
      return;
    }

    try {
      await onSubmitResponseByAuditId({ auditId, responses: finalResp });
      onClose();
    } catch (err: any) {
      alert(`Error submitting response: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} />
            <span>Enter SPOC Corrective Action — {auditId}</span>
          </h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        {actionFindings.length === 0 ? (
          <div className="alert as">No NC/Obs/Risk findings needing response in this audit.</div>
        ) : (
          actionFindings.map(f => {
            const cur = responses[f.id] || {};
            return (
              <div key={f.id} className={`rf ${f.type}`} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className={`badge ${f.type === 't2' ? 'by' : f.type === 't3' ? 'bo' : 'br'}`}>
                    {f.type === 't2' ? 'Observation' : f.type === 't3' ? `Process Risk (${f.subtype || 'Process'})` : 'Non-Compliance (NC)'}
                  </span>
                  <strong>{f.description}</strong>
                </div>

                {(f.type === 't2' || f.type === 't4') && (
                  <div className="fg c3" style={{ marginTop: '8px' }}>
                    <div className="field">
                      <label>Immediate Action *</label>
                      <textarea
                        rows={2}
                        value={cur.imm !== undefined ? cur.imm : f.imm || ''}
                        onChange={e => updateField(f.id, 'imm', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Root Cause Analysis</label>
                      <textarea
                        rows={2}
                        value={cur.rc !== undefined ? cur.rc : f.rc || ''}
                        onChange={e => updateField(f.id, 'rc', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>CAPA (Preventive Plan)</label>
                      <textarea
                        rows={2}
                        value={cur.capa !== undefined ? cur.capa : f.capa || ''}
                        onChange={e => updateField(f.id, 'capa', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {f.type === 't3' && (
                  <div className="field" style={{ marginTop: '8px' }}>
                    <label>Mitigation Plan *</label>
                    <textarea
                      rows={2}
                      value={cur.mitigation !== undefined ? cur.mitigation : f.mitigation || ''}
                      onChange={e => updateField(f.id, 'mitigation', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="brow">
          <button type="button" className="btn btn-o" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-g" onClick={handleSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Check size={14} />
            <span>Save Corrective Actions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------- DEPT MODAL ----------------------
interface DeptModalProps {
  onClose: () => void;
  onSave: (dept: Department) => Promise<void>;
  editingDept?: Department | null;
}

export const DeptModal: React.FC<DeptModalProps> = ({ onClose, onSave, editingDept }) => {
  const [ref, setRef] = useState(editingDept?.ref || '');
  const [dept, setDeptName] = useState(editingDept?.dept || '');
  const [fn, setFn] = useState(editingDept?.fn || '');
  const [sn, setSn] = useState(editingDept?.sn || '');
  const [sm, setSm] = useState(editingDept?.sm || '');
  const [hm, setHm] = useState(editingDept?.hm || '');
  const [hodName, setHodName] = useState(editingDept?.hodName || '');

  // Zone Overrides
  const [showZoneOverrides, setShowZoneOverrides] = useState(!!editingDept?.zoneContacts);
  const [chnSn, setChnSn] = useState(editingDept?.zoneContacts?.Chennai?.sn || '');
  const [chnSm, setChnSm] = useState(editingDept?.zoneContacts?.Chennai?.sm || '');
  const [chnHm, setChnHm] = useState(editingDept?.zoneContacts?.Chennai?.hm || '');
  const [chnHod, setChnHod] = useState(editingDept?.zoneContacts?.Chennai?.hodName || '');

  const [cbeSn, setCbeSn] = useState(editingDept?.zoneContacts?.Coimbatore?.sn || '');
  const [cbeSm, setCbeSm] = useState(editingDept?.zoneContacts?.Coimbatore?.sm || '');
  const [cbeHm, setCbeHm] = useState(editingDept?.zoneContacts?.Coimbatore?.hm || '');
  const [cbeHod, setCbeHod] = useState(editingDept?.zoneContacts?.Coimbatore?.hodName || '');

  const [blrSn, setBlrSn] = useState(editingDept?.zoneContacts?.Bangalore?.sn || '');
  const [blrSm, setBlrSm] = useState(editingDept?.zoneContacts?.Bangalore?.sm || '');
  const [blrHm, setBlrHm] = useState(editingDept?.zoneContacts?.Bangalore?.hm || '');
  const [blrHod, setBlrHod] = useState(editingDept?.zoneContacts?.Bangalore?.hodName || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim() || !dept.trim()) {
      alert('Please provide Ref code and Department name.');
      return;
    }

    const zoneContacts: any = {};
    if (chnSn || chnSm || chnHm || chnHod) {
      zoneContacts.Chennai = { sn: chnSn, sm: chnSm, hm: chnHm, hodName: chnHod };
    }
    if (cbeSn || cbeSm || cbeHm || cbeHod) {
      zoneContacts.Coimbatore = { sn: cbeSn, sm: cbeSm, hm: cbeHm, hodName: cbeHod };
    }
    if (blrSn || blrSm || blrHm || blrHod) {
      zoneContacts.Bangalore = { sn: blrSn, sm: blrSm, hm: blrHm, hodName: blrHod };
    }

    await onSave({
      ref: ref.toUpperCase().trim(),
      dept,
      fn: fn || dept,
      sn,
      sm,
      hm,
      hodName,
      zoneContacts: Object.keys(zoneContacts).length > 0 ? zoneContacts : undefined
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {editingDept ? <Edit2 size={16} /> : <Plus size={16} />}
            <span>{editingDept ? 'Edit Department' : 'Add New Department'}</span>
          </h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Ref Code *</label>
              <input
                type="text"
                value={ref}
                onChange={e => setRef(e.target.value)}
                disabled={!!editingDept}
                placeholder="e.g. CSD"
                required
              />
            </div>
            <div className="field">
              <label>Department Name *</label>
              <input
                type="text"
                value={dept}
                onChange={e => setDeptName(e.target.value)}
                placeholder="Customer Experience"
                required
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '12px' }}>
            <label>Function / Sub-Process Name</label>
            <input type="text" value={fn} onChange={e => setFn(e.target.value)} placeholder="CSD Operations" />
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Default SPOC Name</label>
              <input type="text" value={sn} onChange={e => setSn(e.target.value)} placeholder="e.g. Anand" />
            </div>
            <div className="field">
              <label>Default HOD Name</label>
              <input type="text" value={hodName} onChange={e => setHodName(e.target.value)} placeholder="e.g. Suresh Kumar" />
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '16px' }}>
            <div className="field">
              <label>Default SPOC Email</label>
              <input type="email" value={sm} onChange={e => setSm(e.target.value)} placeholder="anand@casagrand.co.in" />
            </div>
            <div className="field">
              <label>Default HOD Email</label>
              <input type="email" value={hm} onChange={e => setHm(e.target.value)} placeholder="hod.csd@casagrand.co.in" />
            </div>
          </div>

          {/* Toggle Zone-Specific SPOC / HOD Contact Details */}
          <div style={{ marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <button
              type="button"
              className="btn btn-o btn-xs"
              onClick={() => setShowZoneOverrides(!showZoneOverrides)}
              style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              {showZoneOverrides ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span>{showZoneOverrides ? 'Hide Zone-Specific Contacts' : 'Configure Zone-Specific SPOCs & HODs (Chennai / CBE / BLR)'}</span>
            </button>

            {showZoneOverrides && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} />
                  <span>Zone Specific Overrides</span>
                </div>
                
                {/* Chennai */}
                <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand)', marginBottom: '6px' }}>Chennai Zone</div>
                  <div className="fg c2">
                    <input type="text" value={chnSn} onChange={e => setChnSn(e.target.value)} placeholder="Chennai SPOC Name" style={{ fontSize: '11.5px' }} />
                    <input type="email" value={chnSm} onChange={e => setChnSm(e.target.value)} placeholder="Chennai SPOC Email" style={{ fontSize: '11.5px' }} />
                    <input type="text" value={chnHod} onChange={e => setChnHod(e.target.value)} placeholder="Chennai HOD Name" style={{ fontSize: '11.5px' }} />
                    <input type="email" value={chnHm} onChange={e => setChnHm(e.target.value)} placeholder="Chennai HOD Email" style={{ fontSize: '11.5px' }} />
                  </div>
                </div>

                {/* Coimbatore */}
                <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand)', marginBottom: '6px' }}>Coimbatore Zone</div>
                  <div className="fg c2">
                    <input type="text" value={cbeSn} onChange={e => setCbeSn(e.target.value)} placeholder="CBE SPOC Name" style={{ fontSize: '11.5px' }} />
                    <input type="email" value={cbeSm} onChange={e => setCbeSm(e.target.value)} placeholder="CBE SPOC Email" style={{ fontSize: '11.5px' }} />
                    <input type="text" value={cbeHod} onChange={e => setCbeHod(e.target.value)} placeholder="CBE HOD Name" style={{ fontSize: '11.5px' }} />
                    <input type="email" value={cbeHm} onChange={e => setCbeHm(e.target.value)} placeholder="CBE HOD Email" style={{ fontSize: '11.5px' }} />
                  </div>
                </div>

                {/* Bangalore */}
                <div style={{ background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand)', marginBottom: '6px' }}>Bangalore Zone</div>
                  <div className="fg c2">
                    <input type="text" value={blrSn} onChange={e => setBlrSn(e.target.value)} placeholder="BLR SPOC Name" style={{ fontSize: '11.5px' }} />
                    <input type="email" value={blrSm} onChange={e => setBlrSm(e.target.value)} placeholder="BLR SPOC Email" style={{ fontSize: '11.5px' }} />
                    <input type="text" value={blrHod} onChange={e => setBlrHod(e.target.value)} placeholder="BLR HOD Name" style={{ fontSize: '11.5px' }} />
                    <input type="email" value={blrHm} onChange={e => setBlrHm(e.target.value)} placeholder="BLR HOD Email" style={{ fontSize: '11.5px' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="brow">
            <button type="button" className="btn btn-o" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-r" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Save size={14} />
              <span>Save Department</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------- IMPORT MODAL ----------------------
interface ImportModalProps {
  onClose: () => void;
  onImport: (depts: Department[]) => Promise<void>;
  onToast: (msg: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport, onToast }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = async () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const wsName = wb.SheetNames[0];
        const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

        const parsed: Department[] = rows
          .map(r => ({
            ref: (r.Ref || r.ref || r['Ref Code'] || '').toString().trim().toUpperCase(),
            dept: (r.Department || r.dept || r.Dept || '').toString().trim(),
            fn: (r.Function || r.fn || r.dept || '').toString().trim(),
            sn: (r['SPOC Name'] || r.sn || '').toString().trim(),
            sm: (r['SPOC Email'] || r.sm || '').toString().trim(),
            hm: (r['HOD Email'] || r.hm || '').toString().trim()
          }))
          .filter(d => d.ref && d.dept);

        if (parsed.length === 0) {
          onToast('No valid department rows found in CSV/Excel.');
          return;
        }

        await onImport(parsed);
        onToast(`Imported ${parsed.length} department(s) successfully!`);
        onClose();
      } catch (err: any) {
        onToast(`Import error: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} />
            <span>Import Departments (CSV / Excel)</span>
          </h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px' }}>
          Upload an Excel or CSV file containing column headers: <strong>Ref, Department, Function, SPOC Name, SPOC Email, HOD Email</strong>.
        </p>

        <div className="field" style={{ marginBottom: '16px' }}>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="brow">
          <button type="button" className="btn btn-o" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-b" onClick={handleFile} disabled={!file} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Upload size={14} />
            <span>Process Import</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------- USER MODAL ----------------------
interface UserModalProps {
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
  depts: Department[];
  editingUser?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ onClose, onSave, depts, editingUser }) => {
  const [username, setUsername] = useState(editingUser?.username || '');
  const [name, setName] = useState(editingUser?.name || '');
  const [email, setEmail] = useState(editingUser?.email || '');
  const [phone, setPhone] = useState(editingUser?.phone || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(editingUser?.role || 'spoc');
  const [zone, setZone] = useState(editingUser?.zone || 'Chennai');
  const [active, setActive] = useState<boolean>(editingUser?.active ?? true);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(editingUser?.depts || []);

  const toggleDept = (ref: string) => {
    if (selectedDepts.includes(ref)) {
      setSelectedDepts(selectedDepts.filter(r => r !== ref));
    } else {
      setSelectedDepts([...selectedDepts, ref]);
    }
  };

  const selectAllDepts = () => setSelectedDepts(depts.map(d => d.ref));
  const clearAllDepts = () => setSelectedDepts([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) {
      alert('Username and Name are required.');
      return;
    }

    if (password && password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    const updatedUser: User = {
      id: editingUser?.id || `usr-${Date.now()}`,
      username: username.toLowerCase().trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      zone,
      active,
      depts: selectedDepts,
      ...(password ? { pw: h6(password) } : editingUser?.pw ? { pw: editingUser.pw } : { pw: h6('Audit@2026') })
    };

    await onSave(updatedUser);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {editingUser ? <Edit2 size={16} /> : <Plus size={16} />}
            <span>{editingUser ? 'Edit User & Rules' : 'Add New User'}</span>
          </h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>
            <X size={12} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Username (Login ID) *</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={!!editingUser}
                placeholder="e.g. prem.a"
                required
              />
            </div>
            <div className="field">
              <label>Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Prem Anand"
                required
              />
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="prem.a@casagrand.co.in"
              />
            </div>
            <div className="field">
              <label>Phone / Mobile</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>User Role *</label>
              <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value="spoc">SPOC (Department Action Items)</option>
                <option value="hod">HOD (Head of Department Oversight)</option>
                <option value="auditor">Auditor (Conduct Audits & Submit)</option>
                <option value="admin">Admin / Audit Lead (Full System Access)</option>
              </select>
            </div>
            <div className="field">
              <label>Primary Zone Region</label>
              <select value={zone} onChange={e => setZone(e.target.value as any)}>
                <option value="Chennai">Chennai Zone</option>
                <option value="Coimbatore">Coimbatore Zone</option>
                <option value="Bangalore">Bangalore Zone</option>
              </select>
            </div>
          </div>

          <div className="fg c2" style={{ marginBottom: '12px' }}>
            <div className="field">
              <label>{editingUser ? 'Set New Password (Min 6 chars)' : 'Password (Min 6 chars)'}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={editingUser ? 'Leave blank to keep existing password' : 'Default: Audit@2026'}
              />
            </div>
            <div className="field" style={{ justifyContent: 'center' }}>
              <label>Account Status</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#10b981' : '#ef4444' }} />
                  {active ? 'Active Account' : 'Account Suspended / Inactive'}
                </span>
              </label>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>Assigned Department Ref(s) for Role Filtering</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="btn btn-xs btn-o" onClick={selectAllDepts}>Select All</button>
                <button type="button" className="btn btn-xs btn-o" onClick={clearAllDepts}>Clear All</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', maxHeight: '140px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}>
              {depts.map(d => {
                const isSel = selectedDepts.includes(d.ref);
                return (
                  <button
                    key={d.ref}
                    type="button"
                    className={`btn btn-xs ${isSel ? 'btn-b' : 'btn-o'}`}
                    onClick={() => toggleDept(d.ref)}
                  >
                    {isSel ? '✓ ' : ''}[{d.ref}] {d.dept}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="brow">
            <button type="button" className="btn btn-o" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-r" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Save size={14} />
              <span>Save User Rules</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
