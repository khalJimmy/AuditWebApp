import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Search, Pause, Play, Edit2, Trash2 } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onOpenUserModal: (userId?: string) => void;
  onSaveUser?: (user: Partial<User>) => Promise<void>;
  onDeleteUser: (userId: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onOpenUserModal,
  onSaveUser,
  onDeleteUser
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const roleLabels: Record<string, string> = {
    admin: 'Admin / Lead',
    auditor: 'Auditor',
    spoc: 'SPOC',
    hod: 'HOD (Head of Dept)'
  };

  const roleBadge: Record<string, string> = {
    admin: 'br',
    auditor: 'bb',
    spoc: 'bg',
    hod: 'bo'
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (zoneFilter !== 'all' && u.zone !== zoneFilter) return false;
    if (statusFilter === 'active' && u.active === false) return false;
    if (statusFilter === 'inactive' && u.active !== false) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = u.name.toLowerCase().includes(term);
      const matchUser = u.username.toLowerCase().includes(term);
      const matchEmail = (u.email || '').toLowerCase().includes(term);
      if (!matchName && !matchUser && !matchEmail) return false;
    }
    return true;
  });

  const handleToggleActive = async (u: User) => {
    if (!onSaveUser) return;
    const newStatus = u.active === false ? true : false;
    await onSaveUser({ ...u, active: newStatus });
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            User &amp; Role <em>Management Rules</em>
          </div>
          <div className="ps">Login credentials · Role permissions · Contact routing · Active status</div>
        </div>
        <button className="btn btn-r" onClick={() => onOpenUserModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={14} />
          <span>Add User</span>
        </button>
      </div>

      <div className="alert ai" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong>User Roles:</strong>&nbsp;
          <span className="badge br">Admin</span> Full system control &amp; settings.&emsp;
          <span className="badge bb">Auditor</span> Conducts audits &amp; exports reports.&emsp;
          <span className="badge bg">SPOC</span> Submits department CAPA responses.&emsp;
          <span className="badge bo">HOD</span> Receives escalated breach alerts &amp; department oversight.
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{ marginBottom: '14px', padding: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px', background: 'var(--surface2)', borderRadius: '6px', padding: '0 8px', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--muted)', marginRight: '6px' }} />
            <input
              type="text"
              placeholder="Search name, username, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '6px 0', fontSize: '12px' }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin / Lead</option>
            <option value="auditor">Auditor</option>
            <option value="spoc">SPOC</option>
            <option value="hod">HOD</option>
          </select>
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }}
          >
            <option value="all">All Zones</option>
            <option value="Chennai">Chennai Zone</option>
            <option value="Coimbatore">Coimbatore Zone</option>
            <option value="Bangalore">Bangalore Zone</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Suspended Only</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div id="user-list">
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              No users matching the selected filters.
            </div>
          ) : (
            filteredUsers.map(u => {
              const isActive = u.active !== false;
              return (
                <div
                  key={u.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1.2fr 1fr 1.2fr auto auto auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: isActive ? '#fff' : '#f8fafc',
                    opacity: isActive ? 1 : 0.75,
                    marginBottom: '8px'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      background: isActive ? 'var(--surface2)' : '#e2e8f0',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px'
                    }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {u.name}
                      {!isActive && <span className="badge br" style={{ fontSize: '9.5px' }}>SUSPENDED</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      @{u.username} {u.email ? `• ${u.email}` : ''} {u.phone ? `• ${u.phone}` : ''}
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${roleBadge[u.role] || 'bm'}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                    {u.zone ? <span className="badge bm" style={{ fontSize: '10px', marginLeft: '4px' }}>{u.zone}</span> : null}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {u.depts && u.depts.length > 0 ? `Depts: ${u.depts.join(', ')}` : 'All Depts / Unassigned'}
                  </div>
                  {onSaveUser && u.id !== currentUser.id && (
                    <button
                      className={`btn btn-xs ${isActive ? 'btn-o' : 'btn-g'}`}
                      onClick={() => handleToggleActive(u)}
                      title={isActive ? 'Suspend User Account' : 'Activate User Account'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      {isActive ? <Pause size={11} /> : <Play size={11} />}
                      <span>{isActive ? 'Suspend' : 'Activate'}</span>
                    </button>
                  )}
                  <button className="btn btn-o btn-xs" onClick={() => onOpenUserModal(u.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Edit2 size={11} />
                    <span>Edit</span>
                  </button>
                  {u.id !== currentUser.id ? (
                    <button
                      className="btn btn-xs"
                      style={{ background: '#fee2e2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                      onClick={() => onDeleteUser(u.id)}
                      title="Delete User"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
