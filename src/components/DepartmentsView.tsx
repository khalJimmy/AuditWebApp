import React, { useState, useMemo } from 'react';
import { Department } from '../types';
import { DepartmentCatalog } from '../models/DepartmentCatalog';
import { DepartmentModel } from '../models/DepartmentModel';
import * as XLSX from 'xlsx';
import { Plus, Download, Upload, Edit2, Trash2 } from 'lucide-react';

interface DepartmentsViewProps {
  depts: (Department | DepartmentModel)[];
  onOpenDeptModal: (ref?: string) => void;
  onOpenImportModal: () => void;
  onDeleteDept: (ref: string) => void;
  onToast: (msg: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  depts,
  onOpenDeptModal,
  onOpenImportModal,
  onDeleteDept,
  onToast
}) => {
  const [search, setSearch] = useState('');

  const catalog = useMemo(() => new DepartmentCatalog(depts), [depts]);
  const filtered = useMemo(() => catalog.search(search), [catalog, search]);

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = depts.map(d => ({
      Ref: d.ref,
      Department: d.dept,
      Function: d.fn,
      'SPOC Name': d.sn || '',
      'SPOC Email': d.sm || '',
      'HOD Email': d.hm || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Departments');
    XLSX.writeFile(wb, 'Departments_List.xlsx');
    onToast('Exported departments list to Excel');
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="pt">
            Department <em>Management</em>
          </div>
          <div className="ps">Add · Edit · Rename · Delete departments dynamically</div>
        </div>
        <button className="btn btn-r" onClick={() => onOpenDeptModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Plus size={14} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="alert ai">
        Changes update all dropdowns instantly. Deleting removes dept from future selection but preserves existing audit records.
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '11px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search departments…"
            style={{ maxWidth: '280px' }}
          />
          <button className="btn btn-o btn-sm" onClick={exportExcel} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Download size={13} />
            <span>Export List</span>
          </button>
          <button className="btn btn-o btn-sm" onClick={onOpenImportModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Upload size={13} />
            <span>Import CSV</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 1fr 1fr auto',
            gap: '8px',
            alignItems: 'center',
            padding: '7px 12px',
            background: 'var(--surface2)',
            borderRadius: '7px',
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            color: 'var(--muted)',
            marginBottom: '6px'
          }}
        >
          <div>Ref</div>
          <div>Department</div>
          <div>Function</div>
          <div>SPOC</div>
          <div>Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '22px', color: 'var(--muted)' }}>
            No departments found.
          </div>
        ) : (
          filtered.map(d => (
            <div
              key={d.ref}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 1fr 1fr auto',
                gap: '8px',
                alignItems: 'center',
                padding: '9px 12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: '#fff',
                marginBottom: '6px'
              }}
            >
              <div>
                <span className="badge bk" style={{ fontSize: '10px' }}>
                  {d.ref}
                </span>
              </div>
              <div style={{ fontWeight: 500, fontSize: '12.5px' }}>{d.dept}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{d.fn}</div>
              <div style={{ fontSize: '11.5px' }}>
                {d.sn ? <span style={{ color: 'var(--ink)' }}>{d.sn}<br /></span> : null}
                <span style={{ color: 'var(--muted)', fontSize: '10.5px' }}>{d.sm || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="btn btn-o btn-xs" onClick={() => onOpenDeptModal(d.ref)} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Edit2 size={11} />
                  <span>Edit</span>
                </button>
                <button
                  className="btn btn-xs"
                  style={{ background: '#fee2e2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  onClick={() => onDeleteDept(d.ref)}
                  title="Delete Department"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
