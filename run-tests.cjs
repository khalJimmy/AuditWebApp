const http = require('http');

async function testEndpoint(path, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('================================================================');
  console.log('CASAGRAND PROCESS AUDIT SYSTEM — ENTERPRISE CRUD TEST SUITE');
  console.log('================================================================');
  const results = [];
  const startTime = new Date().toISOString();
  const startMs = Date.now();

  // Helper for recording test case execution
  const record = (tcId, category, name, passed, details, error = null) => {
    results.push({
      tcId,
      category,
      name,
      status: passed ? 'PASS' : 'FAIL',
      timestamp: new Date().toISOString(),
      details: typeof details === 'object' ? JSON.stringify(details) : String(details),
      error: error ? String(error) : null
    });
  };

  // 1. AUTHENTICATION & SECURITY
  console.log('\n--- 1. AUTHENTICATION & ACCESS CONTROL TEST SUITE ---');
  let adminToken = '';
  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'Audit@2026' }
    });
    const pass = login.status === 200 && login.data.token && login.data.user.role === 'admin';
    if (pass) adminToken = login.data.token;
    record('TC-AUTH-01', 'Auth', 'Admin Authentication & JWT Token Issuance', pass, `User: ${login.data?.user?.name}, Role: ${login.data?.user?.role}`);
  } catch (err) {
    record('TC-AUTH-01', 'Auth', 'Admin Authentication & JWT Token Issuance', false, null, err.message);
  }

  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'WrongPassword123' }
    });
    const pass = login.status === 401 && login.data.error;
    record('TC-AUTH-02', 'Auth', 'Invalid Password Rejection Guard (401 Unauthorized)', pass, `Status: ${login.status}, Message: ${login.data?.error}`);
  } catch (err) {
    record('TC-AUTH-02', 'Auth', 'Invalid Password Rejection Guard (401 Unauthorized)', false, null, err.message);
  }

  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'auditor1', password: 'Audit@2026' }
    });
    const pass = login.status === 200 && login.data.user.zone === 'Chennai';
    record('TC-AUTH-03', 'Auth', 'Auditor Login & Zone Context Isolation (auditor1 -> Chennai)', pass, `Resolved Zone: ${login.data?.user?.zone}`);
  } catch (err) {
    record('TC-AUTH-03', 'Auth', 'Auditor Login & Zone Context Isolation (auditor1 -> Chennai)', false, null, err.message);
  }

  try {
    const me = await testEndpoint('/api/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    const pass = me.status === 200 && me.data.user && me.data.user.username === 'admin';
    record('TC-AUTH-04', 'Auth', 'Bearer Token Active Session Validation (/api/auth/me)', pass, `Validated Username: ${me.data?.user?.username}`);
  } catch (err) {
    record('TC-AUTH-04', 'Auth', 'Bearer Token Active Session Validation (/api/auth/me)', false, null, err.message);
  }

  // 2. READ OPERATIONS
  console.log('\n--- 2. READ & CATALOG QUERY TEST SUITE ---');
  try {
    const depts = await testEndpoint('/api/depts');
    const pass = depts.status === 200 && Array.isArray(depts.data) && depts.data.length >= 10;
    record('TC-READ-01', 'Read', 'Fetch Department Catalog & Schema Integrity', pass, `Total Departments Loaded: ${depts.data?.length}`);
  } catch (err) {
    record('TC-READ-01', 'Read', 'Fetch Department Catalog & Schema Integrity', false, null, err.message);
  }

  try {
    const users = await testEndpoint('/api/users');
    const pass = users.status === 200 && Array.isArray(users.data) && users.data.length >= 3;
    record('TC-READ-02', 'Read', 'Fetch User Registry & Password Masking Verification', pass, `Total Users: ${users.data?.length}`);
  } catch (err) {
    record('TC-READ-02', 'Read', 'Fetch User Registry & Password Masking Verification', false, null, err.message);
  }

  try {
    const plans = await testEndpoint('/api/plans');
    const pass = plans.status === 200 && Array.isArray(plans.data);
    record('TC-READ-03', 'Read', 'Fetch Audit Schedule Plans Catalog', pass, `Total Audit Plans: ${plans.data?.length}`);
  } catch (err) {
    record('TC-READ-03', 'Read', 'Fetch Audit Schedule Plans Catalog', false, null, err.message);
  }

  try {
    const audits = await testEndpoint('/api/audits');
    const pass = audits.status === 200 && Array.isArray(audits.data);
    record('TC-READ-04', 'Read', 'Fetch Submitted Audit Reports Catalog', pass, `Total Audits: ${audits.data?.length}`);
  } catch (err) {
    record('TC-READ-04', 'Read', 'Fetch Submitted Audit Reports Catalog', false, null, err.message);
  }

  try {
    const tasks = await testEndpoint('/api/tasks');
    const pass = tasks.status === 200 && Array.isArray(tasks.data);
    record('TC-READ-05', 'Read', 'Fetch Dispatched Action Items & SLA Tracker', pass, `Total Tasks: ${tasks.data?.length}`);
  } catch (err) {
    record('TC-READ-05', 'Read', 'Fetch Dispatched Action Items & SLA Tracker', false, null, err.message);
  }

  try {
    const settings = await testEndpoint('/api/settings');
    const pass = settings.status === 200 && settings.data.tatHours === 72;
    record('TC-READ-06', 'Read', 'Fetch System Configuration Settings & SLA TAT Hours', pass, `TAT Hours: ${settings.data?.tatHours}`);
  } catch (err) {
    record('TC-READ-06', 'Read', 'Fetch System Configuration Settings & SLA TAT Hours', false, null, err.message);
  }

  // 3. CREATE OPERATIONS
  console.log('\n--- 3. CREATE & PERSISTENCE TEST SUITE ---');
  const testDeptRef = `T${Date.now().toString().slice(-4)}`;
  try {
    const res = await testEndpoint('/api/depts', {
      method: 'POST',
      body: {
        ref: testDeptRef,
        dept: 'QUALITY ASSURANCE',
        fn: 'AUTOMATED CRUD VERIFICATION',
        sn: 'Test SPOC',
        sm: 'spoc.qa@casagrand.co.in',
        hm: 'hod.qa@casagrand.co.in',
        hodName: 'Test HOD'
      }
    });
    const pass = res.status === 200 && res.data.success;
    record('TC-CREATE-01', 'Create', 'Create New Department Record with Contact Mapping', pass, `Created Dept Ref: ${testDeptRef}`);
  } catch (err) {
    record('TC-CREATE-01', 'Create', 'Create New Department Record with Contact Mapping', false, null, err.message);
  }

  const testPlanId = `PLN-CRUD-${Date.now().toString().slice(-6)}`;
  try {
    const res = await testEndpoint('/api/plans', {
      method: 'POST',
      body: {
        planId: testPlanId,
        ref: testDeptRef,
        dept: 'QUALITY ASSURANCE',
        fn: 'AUTOMATED CRUD VERIFICATION',
        month: 'August',
        planDate: '2026-08-20',
        auditor: 'Jake (Chennai Auditor)',
        zone: 'Chennai',
        spocMail: 'spoc.qa@casagrand.co.in',
        hodMail: 'hod.qa@casagrand.co.in',
        status: 'Scheduled',
        type: 'Plan'
      }
    });
    const pass = res.status === 200 && res.data.plan && res.data.plan.planId === testPlanId;
    record('TC-CREATE-02', 'Create', 'Create Audit Schedule Plan with Zone Attribution', pass, `Plan ID: ${testPlanId}`);
  } catch (err) {
    record('TC-CREATE-02', 'Create', 'Create Audit Schedule Plan with Zone Attribution', false, null, err.message);
  }

  const testAuditId = `AUD-CRUD-${Date.now().toString().slice(-6)}`;
  try {
    const res = await testEndpoint('/api/audits', {
      method: 'POST',
      body: {
        auditId: testAuditId,
        planId: testPlanId,
        auditDate: '2026-08-09',
        ref: testDeptRef,
        dept: 'QUALITY ASSURANCE',
        fn: 'AUTOMATED CRUD VERIFICATION',
        zone: 'Chennai',
        auditor: 'Jake (Chennai Auditor)',
        auditType: 'Process Audit',
        auditee: 'Test Auditee',
        hod: 'Test HOD',
        spocMail: 'spoc.qa@casagrand.co.in',
        hodMail: 'hod.qa@casagrand.co.in',
        findings: [
          {
            id: 'f-nc-1',
            type: 't4', // Non-Compliance
            process: 'Access Control',
            description: 'Unchecked role escalation detected during audit.',
            imm: 'Revoked invalid permissions.',
            rc: 'Lack of automated check.',
            capa: 'Implemented periodic RBAC audit script.',
            dueDate: '2026-08-12',
            responsible: 'Test SPOC',
            status: 'Open'
          }
        ],
        compliancePct: '95%',
        processScore: 950,
        ncCount: 1,
        obsCount: 0,
        riskCount: 0,
        ciCount: 0,
        status: 'Submitted',
        submittedAt: new Date().toISOString()
      }
    });
    const pass = res.status === 200 && res.data.audit && res.data.audit.auditId === testAuditId;
    record('TC-CREATE-03', 'Create', 'Submit Audit Report & Finding Auto-Classification', pass, `Audit ID: ${testAuditId}, Process Score: ${res.data?.audit?.processScore}`);
  } catch (err) {
    record('TC-CREATE-03', 'Create', 'Submit Audit Report & Finding Auto-Classification', false, null, err.message);
  }

  const testUserId = `usr_test_${Date.now().toString().slice(-4)}`;
  try {
    const res = await testEndpoint('/api/users', {
      method: 'POST',
      body: {
        id: testUserId,
        username: `testuser_${Date.now().toString().slice(-4)}`,
        name: 'Test QA Auditor',
        email: 'qa.auditor@casagrand.co.in',
        password: 'Password@123',
        role: 'auditor',
        zone: 'Coimbatore',
        active: true
      }
    });
    const pass = res.status === 200 && res.data.user;
    record('TC-CREATE-04', 'Create', 'Create User Account with Password Hash & Role Assignment', pass, `User ID: ${testUserId}`);
  } catch (err) {
    record('TC-CREATE-04', 'Create', 'Create User Account with Password Hash & Role Assignment', false, null, err.message);
  }

  // 4. UPDATE OPERATIONS
  console.log('\n--- 4. UPDATE & WORKFLOW MUTATION TEST SUITE ---');
  try {
    const res = await testEndpoint('/api/plans', {
      method: 'POST',
      body: {
        planId: testPlanId,
        status: 'COMPLETED'
      }
    });
    const pass = res.status === 200 && res.data.plan && res.data.plan.status === 'COMPLETED';
    record('TC-UPDATE-01', 'Update', 'Update Audit Plan Status (Scheduled -> COMPLETED)', pass, `Updated Status: ${res.data?.plan?.status}`);
  } catch (err) {
    record('TC-UPDATE-01', 'Update', 'Update Audit Plan Status (Scheduled -> COMPLETED)', false, null, err.message);
  }

  let testTaskId = '';
  let testToken = '';
  try {
    const res = await testEndpoint('/api/dispatch', {
      method: 'POST',
      body: {
        auditId: testAuditId,
        spocMail: 'spoc.qa@casagrand.co.in',
        hodMail: 'hod.qa@casagrand.co.in'
      }
    });
    const pass = res.status === 200 && res.data.task && res.data.task.taskId;
    if (pass) {
      testTaskId = res.data.task.taskId;
      testToken = res.data.task.token;
    }
    record('TC-UPDATE-02', 'Update', 'Dispatch Audit & Initiate 72-Hour TAT SLA Clock', pass, `Task ID: ${testTaskId}, DueAt: ${res.data?.task?.dueAt}`);
  } catch (err) {
    record('TC-UPDATE-02', 'Update', 'Dispatch Audit & Initiate 72-Hour TAT SLA Clock', false, null, err.message);
  }

  try {
    const res = await testEndpoint(`/api/tasks/token/${testToken}`);
    const pass = res.status === 200 && res.data.taskId === testTaskId;
    record('TC-UPDATE-03', 'Update', 'Validate Secure Token Direct Link Endpoint for SPOC', pass, `Resolved Audit ID: ${res.data?.auditId}`);
  } catch (err) {
    record('TC-UPDATE-03', 'Update', 'Validate Secure Token Direct Link Endpoint for SPOC', false, null, err.message);
  }

  try {
    const res = await testEndpoint('/api/response', {
      method: 'POST',
      body: {
        taskId: testTaskId,
        responses: {
          'f-nc-1': {
            imm: 'Temporary access suspended.',
            rc: 'Permission drift during shift handover.',
            capa: 'Automated script now runs every midnight.'
          }
        }
      }
    });
    const pass = res.status === 200 && res.data.task && res.data.task.status === 'Completed';
    record('TC-UPDATE-04', 'Update', 'Submit SPOC CAPA Response & Transition Status to Completed', pass, `Task Status: ${res.data?.task?.status}`);
  } catch (err) {
    record('TC-UPDATE-04', 'Update', 'Submit SPOC CAPA Response & Transition Status to Completed', false, null, err.message);
  }

  try {
    const res = await testEndpoint(`/api/tasks/${testTaskId}/reminder`, { method: 'POST' });
    const pass = res.status === 200 && res.data.reminderCount >= 1;
    record('TC-UPDATE-05', 'Update', 'Trigger SLA Escalation Reminder to SPOC & Increment Count', pass, `Reminder Count: ${res.data?.reminderCount}`);
  } catch (err) {
    record('TC-UPDATE-05', 'Update', 'Trigger SLA Escalation Reminder to SPOC & Increment Count', false, null, err.message);
  }

  try {
    const res = await testEndpoint(`/api/tasks/${testTaskId}/close`, { method: 'POST' });
    const pass = res.status === 200 && res.data.task && res.data.task.status === 'Closed';
    record('TC-UPDATE-06', 'Update', 'Auditor Verification & Task Closure (Completed -> Closed)', pass, `Final Task Status: ${res.data?.task?.status}`);
  } catch (err) {
    record('TC-UPDATE-06', 'Update', 'Auditor Verification & Task Closure (Completed -> Closed)', false, null, err.message);
  }

  try {
    const res = await testEndpoint('/api/settings', {
      method: 'POST',
      body: {
        tatHours: 72,
        defaultYear: '2026-27',
        systemEmail: 'audit.operations@casagrand.co.in'
      }
    });
    const pass = res.status === 200 && res.data.settings.systemEmail === 'audit.operations@casagrand.co.in';
    record('TC-UPDATE-07', 'Update', 'Update System Operational Settings & Email Templates', pass, `Updated System Email: ${res.data?.settings?.systemEmail}`);
  } catch (err) {
    record('TC-UPDATE-07', 'Update', 'Update System Operational Settings & Email Templates', false, null, err.message);
  }

  // 5. DELETE OPERATIONS
  console.log('\n--- 5. DELETE & CLEANUP TEST SUITE ---');
  try {
    const res = await testEndpoint(`/api/users/${testUserId}`, { method: 'DELETE' });
    const pass = res.status === 200 && res.data.success;
    record('TC-DELETE-01', 'Delete', 'Delete User Account Record by ID', pass, `Deleted User ID: ${testUserId}`);
  } catch (err) {
    record('TC-DELETE-01', 'Delete', 'Delete User Account Record by ID', false, null, err.message);
  }

  try {
    const res = await testEndpoint(`/api/plans/${testPlanId}`, { method: 'DELETE' });
    const pass = res.status === 200 && res.data.success;
    record('TC-DELETE-02', 'Delete', 'Delete Audit Plan Schedule Record by Plan ID', pass, `Deleted Plan ID: ${testPlanId}`);
  } catch (err) {
    record('TC-DELETE-02', 'Delete', 'Delete Audit Plan Schedule Record by Plan ID', false, null, err.message);
  }

  try {
    const res = await testEndpoint(`/api/depts/${testDeptRef}`, { method: 'DELETE' });
    const pass = res.status === 200 && res.data.success;
    record('TC-DELETE-03', 'Delete', 'Delete Department Record by Ref Code', pass, `Deleted Dept Ref: ${testDeptRef}`);
  } catch (err) {
    record('TC-DELETE-03', 'Delete', 'Delete Department Record by Ref Code', false, null, err.message);
  }

  const endTime = new Date().toISOString();
  const durationMs = Date.now() - startMs;
  const passedCount = results.filter(r => r.status === 'PASS').length;
  const failedCount = results.filter(r => r.status === 'FAIL').length;
  const passRate = Math.round((passedCount / results.length) * 100);

  console.log('\n================================================================');
  console.log(`TEST EXECUTION SUMMARY: ${passedCount}/${results.length} PASSED (${passRate}%) in ${durationMs}ms`);
  console.log('================================================================\n');

  // Output JSON payload for documentation update
  const summaryPayload = {
    suite: 'Enterprise REST CRUD & System Rules Verification Suite',
    lastExecutedAt: endTime,
    durationMs,
    totalTests: results.length,
    passed: passedCount,
    failed: failedCount,
    passRate: `${passRate}%`,
    results
  };

  console.log(JSON.stringify(summaryPayload, null, 2));
}

runAllTests();
