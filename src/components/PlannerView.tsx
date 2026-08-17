import React, { useState } from 'react';
import { AuditPlan, User } from '../types';
import * as XLSX from 'xlsx';
import { Plus, MapPin, Download, Play, Edit2, Trash2 } from 'lucide-react';

interface PlannerViewProps {
  currentUser?: User | null;
  plans: AuditPlan[];
  audits?: any[];
  depts?: any[];
  onOpenPlanModal: (plan?: AuditPlan | null) => void;
  onUpdateStatus?: (planId: string, status: AuditPlan['status']) => void;
  onDeletePlan?: (planId: string) => void;
  onOpenAuditFormForPlan?: (plan: AuditPlan) => void;
  onToast?: (msg: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  currentUser,
  plans,
  onOpenPlanModal,
  onUpdateStatus,
  onDeletePlan,
  onOpenAuditFormForPlan,
  onToast
}) => {
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Auditor zone rule filtering
  const isAuditor = currentUser?.role === 'auditor';
  const auditorZone = currentUser?.zone || '';

  let filteredPlans = plans;

  // If auditor, filter by zone or auditor name
  if (isAuditor && auditorZone) {
    filteredPlans = filteredPlans.filter(p => {
      const matchZone = p.zone ? p.zone.toLowerCase() === auditorZone.toLowerCase() : false;
      const matchPlanIdZone = p.planId.toLowerCase().includes(auditorZone.substring(0, 3).toLowerCase());
      const matchAuditor = p.auditor ? p.auditor.toLowerCase().includes(currentUser.name.toLowerCase()) : false;
      return matchZone || matchPlanIdZone || matchAuditor;
    });
  } else if (zoneFilter) {
    filteredPlans = filteredPlans.filter(p => {
      const z = zoneFilter.toLowerCase();
      return (p.zone && p.zone.toLowerCase() === z) || p.planId.toLowerCase().includes(z.substring(0, 3));
    });
  }

  if (monthFilter) {
    filteredPlans = filteredPlans.filter(p => p.month === monthFilter);
  }
  if (statusFilter) {
    filteredPlans = filteredPlans.filter(p => p.status === statusFilter);
  }

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = filteredPlans.map(p => ({
      'Plan ID': p.planId,
      'Ref': p.ref,
      'Department': p.dept,
      'Function': p.fn,
      'Zone': p.zone || '—',
      'Month': p.month,
      'Plan Date': p.planDate,
      'Auditor': p.auditor || '—',
      'SPOC Mail': p.spocMail || '—',
      'HOD Mail': p.hodMail || '—',
      'Status': p.status,
      'Remarks': p.remarks || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Planner');
    XLSX.writeFile(wb, `Audit_Planner_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast?.('Exported planner to Excel');
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            Monthly <em>Planner</em>
          </div>
          <div className="ps">
            Schedule audits · Notify stakeholders {isAuditor && auditorZone ? ` (Filtered for ${auditorZone} Zone)` : ''}
          </div>
        </div>
        <button className="btn btn-r" onClick={() => onOpenPlanModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={14} />
          <span>Create Plan</span>
        </button>
      </div>

      {isAuditor && (
        <div className="alert ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} style={{ color: 'var(--brand)', flexShrink: 0 }} />
          <div>
            <strong>Auditor Zone Active ({auditorZone}):</strong> Showing plans assigned to or created for <strong>{auditorZone} Zone</strong>.
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '11px', alignItems: 'center' }}>
          {!isAuditor && (
            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
            >
              <option value="">All Zones</option>
              <option value="Chennai">Chennai Zone</option>
              <option value="Coimbatore">Coimbatore Zone</option>
              <option value="Bangalore">Bangalore Zone</option>
            </select>
          )}

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

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
          >
            <option value="">All Statuses</option>
            <option>Scheduled</option>
            <option>COMPLETED</option>
            <option>NOT COMPLETED</option>
            <option>YET TO AUDIT</option>
          </select>

          <button className="btn btn-o btn-sm" onClick={exportExcel} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Ref</th>
                <th>Department</th>
                <th>Function</th>
                <th>Auditor</th>
                <th>Month</th>
                <th>Plan Date</th>
                <th>SPOC Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '22px', color: 'var(--muted)' }}>
                    No plans found. Click Create Plan to begin.
                  </td>
                </tr>
              ) : (
                filteredPlans.map(p => (
                  <tr key={p.planId}>
                    <td>
                      <span className="badge bk" style={{ fontSize: '10px' }}>
                        {p.planId}
                      </span>
                    </td>
                    <td>{p.ref}</td>
                    <td>{p.dept}</td>
                    <td>{p.fn}</td>
                    <td>{p.auditor || '—'}</td>
                    <td>{p.month}</td>
                    <td>{p.planDate}</td>
                    <td style={{ fontSize: '11px' }}>{p.spocMail || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === 'COMPLETED'
                            ? 'bg'
                            : p.status === 'NOT COMPLETED'
                            ? 'br'
                            : p.status === 'YET TO AUDIT'
                            ? 'by'
                            : 'bb'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        value={p.status}
                        onChange={e => onUpdateStatus && onUpdateStatus(p.planId, e.target.value as AuditPlan['status'])}
                        style={{ fontSize: '11px', padding: '3px 6px' }}
                      >
                        <option>Scheduled</option>
                        <option>COMPLETED</option>
                        <option>NOT COMPLETED</option>
                        <option>YET TO AUDIT</option>
                      </select>
                      {onOpenAuditFormForPlan && p.status !== 'COMPLETED' && (
                        <button
                          className="btn btn-g btn-xs"
                          onClick={() => onOpenAuditFormForPlan(p)}
                          title="Fill Audit Report for this Plan"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Play size={11} />
                          <span>Fill Audit</span>
                        </button>
                      )}
                      {onOpenPlanModal && (
                        <button
                          className="btn btn-o btn-xs"
                          onClick={() => onOpenPlanModal(p)}
                          title="Edit Plan"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                      {onDeletePlan && (
                        <button
                          className="btn btn-xs"
                          style={{ background: '#fee2e2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                          onClick={() => onDeletePlan(p.planId)}
                          title="Delete Plan"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
