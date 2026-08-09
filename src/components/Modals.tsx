import React, { useState, useEffect } from 'react';
import { PlanItem, AuditReport, Department, User, UserRole } from '../types';
import { h6 } from '../data/usersData';
import * as XLSX from 'xlsx';

// ---------------------- PLAN MODAL ----------------------
interface PlanModalProps {
  onClose: () => void;
  onSave: (plan: Omit<PlanItem, 'id' | 'createdAt'>) => Promise<void>;
  depts: Department[];
  editingPlan?: PlanItem | null;
}

export const PlanModal: React.FC<PlanModalProps> = ({ onClose, onSave, depts, editingPlan }) => {
  const [ref, setRef] = useState(editingPlan?.ref || (depts[0]?.ref || 'CSD'));
  const [date, setDate] = useState(editingPlan?.date || new Date().toISOString().split('T')[0]);
  const [auditor, setAuditor] = useState(editingPlan?.auditor || 'Prem Anand');
  const [auditee, setAuditee] = useState(editingPlan?.auditee || '');
  const [hod, setHod] = useState(editingPlan?.hod || '');
  const [spocMail, setSpocMail] = useState(editingPlan?.spocMail || '');
  const [hodMail, setHodMail] = useState(editingPlan?.hodMail || '');
  const [notes, setNotes] = useState(editingPlan?.notes || '');

  // Auto-fill SPOC & HOD email if dept changes
  useEffect(() => {
    const d = depts.find(x => x.ref === ref);
    if (d) {
      if (!spocMail) setSpocMail(d.sm || '');
      if (!hodMail) setHodMail(d.hm || '');
    }
  }, [ref, depts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = depts.find(x => x.ref === ref);
    await onSave({
      ref,
      dept: d?.dept || ref,
      fn: d?.fn || ref,
      date,
      auditor,
      auditee,
      hod,
      spocMail,
      hodMail,
      notes
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>{editingPlan ? '✏ Edit Audit Plan' : '+ Schedule New Audit'}</h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: '12px' }}>
            <label>Department / Function *</label>
            <select value={ref} onChange={e => setRef(e.target.value)} required>
              {depts.map(d => (
                <option key={d.ref} value={d.ref}>
                  [{d.ref}] {d.dept} — {d.fn}
                </option>
              ))}
            </select>
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
            <button type="submit" className="btn btn-r">💾 Save Schedule</button>
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
  onClose: () => void;
  onDispatch: (params: { auditId: string; spocMail: string; hodMail: string }) => Promise<void>;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({ auditId, audit, depts, onClose, onDispatch }) => {
  const deptMatch = depts.find(d => d.ref === audit.ref || d.dept === audit.dept);
  const [spocMail, setSpocMail] = useState(audit.spocMail || deptMatch?.sm || 'spoc@casagrand.co.in');
  const [hodMail, setHodMail] = useState(audit.hodMail || deptMatch?.hm || 'hod@casagrand.co.in');
  const [dispatching, setDispatching] = useState(false);

  const handleSend = async () => {
    if (!spocMail) {
      alert('Please provide a SPOC email address.');
      return;
    }
    try {
      setDispatching(true);
      await onDispatch({ auditId, spocMail, hodMail });
      onClose();
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>📧 Dispatch Audit Findings — {auditId}</h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>✕</button>
        </div>

        <div className="alert ai" style={{ marginBottom: '14px' }}>
          This will generate a 72-hour TAT task for <strong>{audit.dept}</strong> and trigger email notifications to the SPOC with a secure response link.
        </div>

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

        <div style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
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
          <button type="button" className="btn btn-r" onClick={handleSend} disabled={dispatching}>
            {dispatching ? 'Sending Notification…' : '🚀 Dispatch Now & Start 72h Clock'}
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
          <h3>📝 Enter SPOC Corrective Action — {auditId}</h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>✕</button>
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
          <button type="button" className="btn btn-g" onClick={handleSubmit}>
            ✅ Save Corrective Actions
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim() || !dept.trim()) {
      alert('Please provide Ref code and Department name.');
      return;
    }
    await onSave({ ref: ref.toUpperCase().trim(), dept, fn: fn || dept, sn, sm, hm });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>{editingDept ? '✏ Edit Department' : '+ Add New Department'}</h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>✕</button>
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

          <div className="field" style={{ marginBottom: '12px' }}>
            <label>SPOC Name</label>
            <input type="text" value={sn} onChange={e => setSn(e.target.value)} placeholder="e.g. Anand" />
          </div>

          <div className="fg c2" style={{ marginBottom: '16px' }}>
            <div className="field">
              <label>SPOC Email</label>
              <input type="email" value={sm} onChange={e => setSm(e.target.value)} placeholder="anand@casagrand.co.in" />
            </div>
            <div className="field">
              <label>HOD Email</label>
              <input type="email" value={hm} onChange={e => setHm(e.target.value)} placeholder="hod.csd@casagrand.co.in" />
            </div>
          </div>

          <div className="brow">
            <button type="button" className="btn btn-o" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-r">💾 Save Department</button>
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
          onToast('❌ No valid department rows found in CSV/Excel.');
          return;
        }

        await onImport(parsed);
        onToast(`✅ Imported ${parsed.length} department(s) successfully!`);
        onClose();
      } catch (err: any) {
        onToast(`❌ Import error: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>⬆ Import Departments (CSV / Excel)</h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>✕</button>
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
          <button type="button" className="btn btn-b" onClick={handleFile} disabled={!file}>
            ⬆ Process Import
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
          <h3>{editingUser ? '✏ Edit User & Rules' : '+ Add New User'}</h3>
          <button className="btn btn-o btn-xs" onClick={onClose}>✕</button>
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
                {active ? '🟢 Active Account' : '🔴 Account Suspended / Inactive'}
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
            <button type="submit" className="btn btn-r">💾 Save User Rules</button>
          </div>
        </form>
      </div>
    </div>
  );
};
