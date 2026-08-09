import React, { useState } from 'react';
import { KanbanItem, UserRole } from '../types';

const INITIAL_KANBAN_ITEMS: KanbanItem[] = [
  {
    id: 'kb-1',
    title: 'User Management & Role Permissions',
    category: 'User Rules',
    column: 'verified',
    priority: 'High',
    assignedRole: 'admin',
    description: 'Enforces role-based permissions (Admin, Auditor, SPOC, HOD), active status toggles, and password rules.',
    verificationLogRef: 'Section 2 — User Security',
    lastCheckedAt: '2026-08-08 00:15'
  },
  {
    id: 'kb-2',
    title: 'Finding Classification (NC, Obs, Risk, CI)',
    category: 'Audit Engine',
    column: 'verified',
    priority: 'High',
    assignedRole: 'auditor',
    description: 'Replaced t1-t4 codes with explicit non-technical terminology across forms, exports, dispatches, and records.',
    verificationLogRef: 'Section 3.C — Finding Auto-Classification',
    lastCheckedAt: '2026-08-08 00:12'
  },
  {
    id: 'kb-3',
    title: 'Audit Form & Planner Auto Pre-fill Bridge',
    category: 'Audit Engine',
    column: 'verified',
    priority: 'High',
    assignedRole: 'auditor',
    description: 'Auto-populates department, auditor name, zone, and SPOC emails when launching audits directly from the plan.',
    verificationLogRef: 'Section 3.B — Pre-fill Engine',
    lastCheckedAt: '2026-08-08 00:10'
  },
  {
    id: 'kb-4',
    title: '72-Hour TAT & Overdue SLA Counter',
    category: 'SLA & TAT',
    column: 'in_progress',
    priority: 'High',
    assignedRole: 'spoc',
    description: 'Real-time countdown for open SPOC action items. Calculates remaining hours and triggers urgent warning badges.',
    verificationLogRef: 'Section 3.D — TAT Tracker',
    lastCheckedAt: '2026-08-08 00:05'
  },
  {
    id: 'kb-5',
    title: 'Email Dispatch & SPOC Response Overlay',
    category: 'Dispatches',
    column: 'in_progress',
    priority: 'High',
    assignedRole: 'spoc',
    description: 'Generates secure tokens and email dispatch cards allowing SPOCs to submit Immediate Correction + CAPA.',
    verificationLogRef: 'Section 3.D — Dispatch Engine',
    lastCheckedAt: '2026-08-08 00:02'
  },
  {
    id: 'kb-6',
    title: 'Executive Dashboard & Zone Metrics',
    category: 'Analytics',
    column: 'verified',
    priority: 'Medium',
    assignedRole: 'admin',
    description: 'Aggregates multi-zone compliance scores, NC resolution counts, and departmental performance trends.',
    verificationLogRef: 'Section 3.E — Analytics',
    lastCheckedAt: '2026-08-07 23:55'
  },
  {
    id: 'kb-7',
    title: 'HOD Escalation Rule (>72h Breach)',
    category: 'SLA & TAT',
    column: 'backlog',
    priority: 'High',
    assignedRole: 'hod',
    description: 'Escalates unclosed NC findings to HOD email addresses automatically upon SLA breach threshold.',
    verificationLogRef: 'Section 2 — HOD Escalation',
    lastCheckedAt: '2026-08-07 23:40'
  },
  {
    id: 'kb-8',
    title: 'Automated Daily SLA Reminder Dispatch',
    category: 'Dispatches',
    column: 'backlog',
    priority: 'Medium',
    assignedRole: 'admin',
    description: 'Scheduled email reminder job for findings with <24 hours SLA remaining.',
    verificationLogRef: 'Section 3.D — Reminders',
    lastCheckedAt: '2026-08-07 23:30'
  }
];

export const KanbanBoardView: React.FC = () => {
  const [items, setItems] = useState<KanbanItem[]>(INITIAL_KANBAN_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  
  // New Item State
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<KanbanItem['category']>('User Rules');
  const [newPriority, setNewPriority] = useState<KanbanItem['priority']>('High');
  const [newRole, setNewRole] = useState<UserRole | 'all'>('admin');
  const [newDesc, setNewDesc] = useState<string>('');

  const moveItem = (id: string, targetCol: KanbanItem['column']) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, column: targetCol, lastCheckedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) }
          : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem: KanbanItem = {
      id: `kb-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      column: 'in_progress',
      priority: newPriority,
      assignedRole: newRole,
      description: newDesc.trim() || 'Operational check item.',
      lastCheckedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setItems([newItem, ...items]);
    setShowNewModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && item.priority !== selectedPriority) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(term);
      const matchDesc = item.description.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const columns: { key: KanbanItem['column']; title: string; badgeClass: string; icon: string }[] = [
    { key: 'verified', title: 'Verified & Operational', badgeClass: 'bg', icon: '✅' },
    { key: 'in_progress', title: 'In Progress / Monitoring', badgeClass: 'by', icon: '⏳' },
    { key: 'backlog', title: 'Backlog & Rules Check', badgeClass: 'bb', icon: '📋' }
  ];

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            System Operations <em>Kanban Board</em>
          </div>
          <div className="ps">Real-time status tracking of system rules, audit functions, and SLA workflows</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-o" onClick={() => setShowLogModal(true)}>
            📖 View System Audit Log
          </button>
          <button className="btn btn-r" onClick={() => setShowNewModal(true)}>
            + Add Verification Task
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="card" style={{ marginBottom: '16px', padding: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search operational functions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '220px', padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }}
          />
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginRight: '6px' }}>Category:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }}
            >
              <option value="All">All Categories</option>
              <option value="User Rules">User Rules</option>
              <option value="Audit Engine">Audit Engine</option>
              <option value="SLA & TAT">SLA &amp; TAT</option>
              <option value="Dispatches">Dispatches</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginRight: '6px' }}>Priority:</label>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'start' }}>
        {columns.map(col => {
          const colItems = filteredItems.filter(i => i.column === col.key);
          return (
            <div
              key={col.key}
              style={{
                background: 'var(--surface2)',
                borderRadius: '10px',
                padding: '12px',
                border: '1px solid var(--border)',
                minHeight: '450px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid var(--border)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{col.icon}</span> {col.title}
                </div>
                <span className={`badge ${col.badgeClass}`}>{colItems.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {colItems.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      color: 'var(--muted)',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      border: '1px dashed var(--border)',
                      borderRadius: '8px'
                    }}
                  >
                    No tasks in this column.
                  </div>
                ) : (
                  colItems.map(item => (
                    <div
                      key={item.id}
                      className="card"
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        borderLeft: item.priority === 'High' ? '4px solid #ef4444' : item.priority === 'Medium' ? '4px solid #f59e0b' : '4px solid #3b82f6'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span className="badge bm" style={{ fontSize: '10px' }}>{item.category}</span>
                        <span className={`badge ${item.priority === 'High' ? 'br' : item.priority === 'Medium' ? 'by' : 'bb'}`} style={{ fontSize: '9.5px' }}>
                          {item.priority}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)', marginBottom: '4px' }}>
                        {item.title}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '8px', lineHeight: '1.4' }}>
                        {item.description}
                      </div>

                      {item.verificationLogRef && (
                        <div style={{ fontSize: '10px', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '8px' }}>
                          Ref: {item.verificationLogRef}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                          Checked: {item.lastCheckedAt}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {col.key !== 'verified' && (
                            <button
                              className="btn btn-xs btn-g"
                              onClick={() => moveItem(item.id, 'verified')}
                              title="Mark as Verified"
                            >
                              ✓ Verify
                            </button>
                          )}
                          {col.key !== 'in_progress' && (
                            <button
                              className="btn btn-xs btn-o"
                              onClick={() => moveItem(item.id, 'in_progress')}
                              title="Move to Monitoring"
                            >
                              ⏳ Monitor
                            </button>
                          )}
                          {col.key !== 'backlog' && (
                            <button
                              className="btn btn-xs btn-o"
                              onClick={() => moveItem(item.id, 'backlog')}
                              title="Move to Backlog"
                            >
                              📋 Backlog
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SYSTEM VERIFICATION LOG MODAL */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>📄 System Operational Verification Log</h3>
              <button className="btn btn-o btn-xs" onClick={() => setShowLogModal(false)}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', lineHeight: '1.6' }}>
              <h4>CASAGRAND Process Audit System — Verification Report</h4>
              <p><strong>Version:</strong> v4.0 (Live) | <strong>Date:</strong> 2026-08-08</p>
              <hr style={{ margin: '12px 0', borderColor: 'var(--border)' }} />

              <h5 style={{ fontWeight: 700, marginTop: '12px' }}>1. User Management Rules &amp; Role Enforcement</h5>
              <ul>
                <li><strong>Admin:</strong> Complete system control across all zones, user management, and department settings.</li>
                <li><strong>Auditor:</strong> Conducts audits, pre-fills plan details, and exports compliance reports.</li>
                <li><strong>SPOC:</strong> Filtered department views for submitting corrective action plans within 72h TAT.</li>
                <li><strong>HOD:</strong> Oversight for department metrics and high-priority SLA breach escalations.</li>
                <li><strong>Account Control:</strong> Instant account suspension capability (`active: false`) without losing audit logs.</li>
              </ul>

              <h5 style={{ fontWeight: 700, marginTop: '12px' }}>2. Finding Classification Engine</h5>
              <ul>
                <li><strong>Non-Compliance (NC):</strong> Critical process breaches requiring Immediate Action + Root Cause + CAPA.</li>
                <li><strong>Observation:</strong> Minor deviations requiring CAPA within 72 hours.</li>
                <li><strong>Process Risk:</strong> Financial/Process/Compliance risk requiring structured mitigation.</li>
                <li><strong>Continuous Improvement (CI):</strong> Positive practice observation (No SPOC action required).</li>
              </ul>

              <h5 style={{ fontWeight: 700, marginTop: '12px' }}>3. Pre-fill Engine &amp; Email Dispatch</h5>
              <ul>
                <li>Plan bridge pre-fills zone, auditor, and SPOC email addresses into the audit form automatically.</li>
                <li>Email dispatch generates secure tokens and TAT countdown timer.</li>
              </ul>
            </div>

            <div className="brow" style={{ marginTop: '16px' }}>
              <button className="btn btn-b" onClick={() => setShowLogModal(false)}>Close Log</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW VERIFICATION TASK MODAL */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>+ Add Operational Task</h3>
              <button className="btn btn-o btn-xs" onClick={() => setShowNewModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddItem}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label>Task Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Verify HOD Escalation Email Dispatch"
                  required
                />
              </div>

              <div className="fg c2" style={{ marginBottom: '12px' }}>
                <div className="field">
                  <label>Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)}>
                    <option value="User Rules">User Rules</option>
                    <option value="Audit Engine">Audit Engine</option>
                    <option value="SLA & TAT">SLA &amp; TAT</option>
                    <option value="Dispatches">Dispatches</option>
                    <option value="Analytics">Analytics</option>
                  </select>
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label>Assigned Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as any)}>
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="auditor">Auditor</option>
                  <option value="spoc">SPOC</option>
                  <option value="hod">HOD</option>
                </select>
              </div>

              <div className="field" style={{ marginBottom: '16px' }}>
                <label>Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Details about what needs to be verified..."
                />
              </div>

              <div className="brow">
                <button type="button" className="btn btn-o" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-r">Add to Kanban</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
