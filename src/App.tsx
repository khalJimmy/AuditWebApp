import React, { useState, useEffect } from 'react';
import './firebase';
import { useAuth } from './hooks/useAuth';
import { useAuditData } from './hooks/useAuditData';

import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Toast } from './components/Toast';

import { DashboardView } from './components/DashboardView';
import { PlannerView } from './components/PlannerView';
import { AuditFormView } from './components/AuditFormView';
import { DispatchView } from './components/DispatchView';
import { TrackerView } from './components/TrackerView';
import { RecordsView } from './components/RecordsView';
import { SpocActionsView } from './components/SpocActionsView';
import { SpocRespondOverlay } from './components/SpocRespondOverlay';
import { DepartmentsView } from './components/DepartmentsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';

import {
  PlanModal,
  DispatchModal,
  ResponseModal,
  DeptModal,
  ImportModal,
  UserModal
} from './components/Modals';

import { PlanItem } from './types';

export function App() {
  const { user, loading, login, logout } = useAuth();
  const auditData = useAuditData(user);

  // Check URL query parameters for direct SPOC token link (e.g. ?token=cg-spoc-...)
  const [urlToken, setUrlToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setUrlToken(token);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dash');

  // Selected plan for starting an audit
  const [selectedPlanForAudit, setSelectedPlanForAudit] = useState<PlanItem | null>(null);

  // Modal states
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

  const [dispatchAuditId, setDispatchAuditId] = useState<string | null>(null);
  const [responseAuditId, setResponseAuditId] = useState<string | null>(null);

  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);
  const [editingDeptRef, setEditingDeptRef] = useState<string | null>(null);

  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Set default tab based on user role when logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'spoc') {
        setActiveTab('spoc');
      } else {
        setActiveTab('dash');
      }
    }
  }, [user]);

  // Handle direct link overlay close
  if (urlToken) {
    return (
      <SpocRespondOverlay
        token={urlToken}
        onClose={() => {
          setUrlToken(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
      />
    );
  }

  // Handle Initial Supabase Session Loading State
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #e11d48, #be123c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.4)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" fill="#ffffff" />
          </svg>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '6px' }}>
          CASAGRAND
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px' }}>
          Process Audit &amp; Quality Workflow
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#cbd5e1'
        }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid #e11d48',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          Connecting to Supabase Session...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Handle Unauthenticated
  if (!user) {
    return <LoginScreen onLogin={login} toast={auditData.toastMessage} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentUser={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={logout}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'dash' && (
          <DashboardView
            currentUser={user}
            audits={auditData.audits}
            tasks={auditData.tasks}
            plans={auditData.plans}
            depts={auditData.depts}
            onSelectTab={setActiveTab}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'plan' && (
          <PlannerView
            currentUser={user}
            plans={auditData.plans}
            audits={auditData.audits}
            depts={auditData.depts}
            onOpenPlanModal={plan => {
              setEditingPlan(plan || null);
              setShowPlanModal(true);
            }}
            onUpdateStatus={(planId, status) => auditData.savePlan({ planId, status })}
            onDeletePlan={auditData.deletePlan}
            onOpenAuditFormForPlan={plan => {
              setSelectedPlanForAudit(plan);
              setActiveTab('audit');
            }}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'audit' && (
          <AuditFormView
            depts={auditData.depts}
            plans={auditData.plans}
            initialPlan={selectedPlanForAudit}
            settings={auditData.settings}
            currentUser={user}
            onSubmitAudit={async audit => {
              const res = await auditData.submitAudit(audit);
              setSelectedPlanForAudit(null);
              return res;
            }}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'dispatch' && (
          <DispatchView
            audits={auditData.audits}
            tasks={auditData.tasks}
            depts={auditData.depts}
            onOpenDispatchModal={id => setDispatchAuditId(id)}
            onOpenResponseModal={id => setResponseAuditId(id)}
            onCloseTask={auditData.closeTask}
            onSendReminder={auditData.sendReminder}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerView
            tasks={auditData.tasks}
            audits={auditData.audits}
            onOpenResponseModal={id => setResponseAuditId(id)}
            onCloseTask={auditData.closeTask}
            onSendReminder={auditData.sendReminder}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'records' && (
          <RecordsView
            audits={auditData.audits}
            tasks={auditData.tasks}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'spoc' && (
          <SpocActionsView
            user={user}
            tasks={auditData.tasks}
            audits={auditData.audits}
            onSubmitResponse={auditData.submitSpocResponse}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'depts' && (
          <DepartmentsView
            depts={auditData.depts}
            onOpenDeptModal={ref => {
              setEditingDeptRef(ref || null);
              setShowDeptModal(true);
            }}
            onOpenImportModal={() => setShowImportModal(true)}
            onDeleteDept={auditData.deleteDept}
            onToast={auditData.addToast}
          />
        )}

        {activeTab === 'users' && (
          <UsersView
            users={auditData.users}
            currentUser={user}
            onOpenUserModal={id => {
              setEditingUserId(id || null);
              setShowUserModal(true);
            }}
            onSaveUser={auditData.saveUser}
            onDeleteUser={auditData.deleteUser}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={auditData.settings}
            currentUser={user}
            onSaveSettings={auditData.updateSettings}
            onResetData={auditData.resetData}
            onToast={auditData.addToast}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          background: '#fff',
          padding: '12px 28px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--muted)',
          marginTop: 'auto'
        }}
      >
        <div>
          © {new Date().getFullYear()} <strong>Casagrand Builder Private Limited</strong>. Process Audit & Quality Operations.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>SLA: 72 Hours Response</span>
          <span>Version 3.4.0 (Cloud Run)</span>
        </div>
      </footer>

      {/* MODALS */}
      {showPlanModal && (
        <PlanModal
          onClose={() => {
            setShowPlanModal(false);
            setEditingPlan(null);
          }}
          onSave={auditData.savePlan}
          depts={auditData.depts}
          editingPlan={editingPlan}
          currentUser={user}
        />
      )}

      {dispatchAuditId && (
        <DispatchModal
          auditId={dispatchAuditId}
          audit={auditData.audits.find(a => a.auditId === dispatchAuditId)!}
          depts={auditData.depts}
          settings={auditData.settings}
          onClose={() => setDispatchAuditId(null)}
          onDispatch={auditData.dispatchTask}
        />
      )}

      {responseAuditId && (
        <ResponseModal
          auditId={responseAuditId}
          audit={auditData.audits.find(a => a.auditId === responseAuditId)!}
          onClose={() => setResponseAuditId(null)}
          onSubmitResponseByAuditId={auditData.submitResponseByAuditId}
        />
      )}

      {showDeptModal && (
        <DeptModal
          onClose={() => {
            setShowDeptModal(false);
            setEditingDeptRef(null);
          }}
          onSave={auditData.saveDept}
          editingDept={
            editingDeptRef ? auditData.depts.find(d => d.ref === editingDeptRef) || null : null
          }
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={auditData.importDepts}
          onToast={auditData.addToast}
        />
      )}

      {showUserModal && (
        <UserModal
          onClose={() => {
            setShowUserModal(false);
            setEditingUserId(null);
          }}
          onSave={auditData.saveUser}
          depts={auditData.depts}
          editingUser={
            editingUserId ? auditData.users.find(u => u.id === editingUserId) || null : null
          }
        />
      )}

      <Toast message={auditData.toastMessage} onClose={() => auditData.addToast(null)} />
    </div>
  );
}

export default App;
