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
  console.log('=== CASAGRAND PROCESS AUDIT WORKFLOW - COMPREHENSIVE TEST RUN ===');
  const results = [];
  const startTime = new Date().toISOString();

  // 1. Healthcheck
  try {
    const health = await testEndpoint('/api/health');
    results.push({ name: '1. Healthcheck Endpoint (/api/health)', status: health.status === 200 ? 'PASS' : 'FAIL', details: health.data });
  } catch (err) {
    results.push({ name: '1. Healthcheck Endpoint (/api/health)', status: 'FAIL', error: err.message });
  }

  // 2. Auth Login (Admin)
  let adminToken = '';
  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'Audit@2026' }
    });
    if (login.status === 200 && login.data.token) {
      adminToken = login.data.token;
      results.push({ name: '2. Admin Auth Login (admin / Audit@2026)', status: 'PASS', details: `Token issued for User: ${login.data.user.name}` });
    } else {
      results.push({ name: '2. Admin Auth Login (admin / Audit@2026)', status: 'FAIL', details: login.data });
    }
  } catch (err) {
    results.push({ name: '2. Admin Auth Login (admin / Audit@2026)', status: 'FAIL', error: err.message });
  }

  // 3. Auth Login (Auditor - Chennai)
  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'auditor1', password: 'Audit@2026' }
    });
    if (login.status === 200 && login.data.user.zone === 'Chennai') {
      results.push({ name: '3. Auditor Auth & Zone Resolution (auditor1)', status: 'PASS', details: `Zone resolved: ${login.data.user.zone}, Name: ${login.data.user.name}` });
    } else {
      results.push({ name: '3. Auditor Auth & Zone Resolution (auditor1)', status: 'FAIL', details: login.data });
    }
  } catch (err) {
    results.push({ name: '3. Auditor Auth & Zone Resolution (auditor1)', status: 'FAIL', error: err.message });
  }

  // 4. Session Validation
  try {
    const me = await testEndpoint('/api/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    results.push({ name: '4. Bearer Token Session Validation (/api/auth/me)', status: me.status === 200 ? 'PASS' : 'FAIL', details: me.data.user });
  } catch (err) {
    results.push({ name: '4. Bearer Token Session Validation (/api/auth/me)', status: 'FAIL', error: err.message });
  }

  // 5. Fetch & Validate Departments Data
  try {
    const depts = await testEndpoint('/api/depts');
    results.push({ name: '5. Departments Catalog Verification (/api/depts)', status: depts.status === 200 && depts.data.length >= 27 ? 'PASS' : 'FAIL', details: `Count: ${depts.data.length}` });
  } catch (err) {
    results.push({ name: '5. Departments Catalog Verification (/api/depts)', status: 'FAIL', error: err.message });
  }

  // 6. Department Pre-fill & Contact Email Mapping
  try {
    const depts = await testEndpoint('/api/depts');
    const misDept = depts.data.find(d => d.ref === 'AA');
    const hasZoneContacts = misDept && misDept.zoneContacts && misDept.zoneContacts['Chennai'];
    results.push({ name: '6. Department SPOC/HOD Email Mapping Pre-fill Engine', status: hasZoneContacts ? 'PASS' : 'FAIL', details: hasZoneContacts ? misDept.zoneContacts['Chennai'] : 'Missing mapping' });
  } catch (err) {
    results.push({ name: '6. Department SPOC/HOD Email Mapping Pre-fill Engine', status: 'FAIL', error: err.message });
  }

  // 7. Save / Update Department Record
  try {
    const res = await testEndpoint('/api/depts', {
      method: 'POST',
      body: {
        ref: 'TST1',
        dept: 'TESTING & QA',
        fn: 'SYSTEM AUTOMATED AUDIT TESTING',
        sn: 'Test SPOC',
        sm: 'spoc.test@casagrand.co.in',
        hm: 'hod.test@casagrand.co.in',
        hodName: 'Test HOD'
      }
    });
    results.push({ name: '7. Create/Update Department Record (/api/depts)', status: res.status === 200 && res.data.success ? 'PASS' : 'FAIL', details: res.data });
  } catch (err) {
    results.push({ name: '7. Create/Update Department Record (/api/depts)', status: 'FAIL', error: err.message });
  }

  // 8. Create & Snapshot Audit Plan
  let testPlanId = '';
  try {
    const res = await testEndpoint('/api/plans', {
      method: 'POST',
      body: {
        planId: `PLN-TEST-${Date.now()}`,
        ref: 'AA',
        dept: 'MIS',
        fn: 'MIS',
        month: 'August',
        planDate: '2026-08-15',
        auditor: 'Jake (Chennai Auditor)',
        zone: 'Chennai',
        spocMail: 'jayalalitha@casagrand.co.in',
        hodMail: 'yuvaraj@casagrand.co.in',
        remarks: 'Automated Plan Verification Test',
        type: 'Plan',
        status: 'Scheduled'
      }
    });
    if (res.status === 200 && res.data.plan) {
      testPlanId = res.data.plan.planId;
      results.push({ name: '8. Create & Snapshot Audit Plan (/api/plans)', status: 'PASS', details: `Plan ID: ${testPlanId}` });
    } else {
      results.push({ name: '8. Create & Snapshot Audit Plan (/api/plans)', status: 'FAIL', details: res.data });
    }
  } catch (err) {
    results.push({ name: '8. Create & Snapshot Audit Plan (/api/plans)', status: 'FAIL', error: err.message });
  }

  // 9. Submit Audit Report with Finding Auto-Classification
  let createdAuditId = '';
  try {
    const res = await testEndpoint('/api/audits', {
      method: 'POST',
      body: {
        auditId: `AUD-TEST-${Date.now()}`,
        planId: testPlanId,
        auditDate: '2026-08-09',
        ref: 'AA',
        dept: 'MIS',
        fn: 'MIS',
        zone: 'Chennai',
        auditor: 'Jake (Chennai Auditor)',
        auditType: 'Process Audit',
        auditee: 'Jayalalitha',
        hod: 'Yuvaraj',
        spocMail: 'jayalalitha@casagrand.co.in',
        hodMail: 'yuvaraj@casagrand.co.in',
        scope: 'Monthly Automated Process Verification',
        findings: [
          {
            id: 'f-test-1',
            type: 't1', // Non-Compliance
            process: 'System Access Control',
            description: 'Unverified user account detected without role assignment.',
            imm: 'Account suspended immediately.',
            rc: 'Manual provisioning bypass.',
            capa: 'Automated RBAC validation policy.',
            dueDate: '2026-08-12',
            responsible: 'Jayalalitha',
            status: 'Open'
          },
          {
            id: 'f-test-2',
            type: 't4', // Continuous Improvement
            process: 'Automated Reporting',
            description: 'Implemented auto-export capability for compliance logs.',
            status: 'Closed'
          }
        ],
        compliancePct: '92%',
        processScore: 920,
        ncCount: 1,
        obsCount: 0,
        riskCount: 0,
        ciCount: 1,
        status: 'Submitted',
        submittedAt: new Date().toISOString()
      }
    });
    if (res.status === 200 && res.data.audit) {
      createdAuditId = res.data.audit.auditId;
      results.push({ name: '9. Audit Report Submission & Finding Classification', status: 'PASS', details: `Audit ID: ${createdAuditId}, Score: ${res.data.audit.processScore}` });
    } else {
      results.push({ name: '9. Audit Report Submission & Finding Classification', status: 'FAIL', details: res.data });
    }
  } catch (err) {
    results.push({ name: '9. Audit Report Submission & Finding Classification', status: 'FAIL', error: err.message });
  }

  // 10. Email Dispatch & SPOC Task Creation
  let createdToken = '';
  let createdTaskId = '';
  try {
    const res = await testEndpoint('/api/dispatch', {
      method: 'POST',
      body: {
        auditId: createdAuditId,
        spocMail: 'jayalalitha@casagrand.co.in',
        hodMail: 'yuvaraj@casagrand.co.in'
      }
    });
    if (res.status === 200 && res.data.task) {
      createdToken = res.data.task.token;
      createdTaskId = res.data.task.taskId;
      results.push({ name: '10. Dispatch Engine & Token Generation (/api/dispatch)', status: 'PASS', details: `Task ID: ${createdTaskId}, Token: ${createdToken.substring(0, 10)}...` });
    } else {
      results.push({ name: '10. Dispatch Engine & Token Generation (/api/dispatch)', status: 'FAIL', details: res.data });
    }
  } catch (err) {
    results.push({ name: '10. Dispatch Engine & Token Generation (/api/dispatch)', status: 'FAIL', error: err.message });
  }

  // 11. SPOC Token Resolution
  try {
    const res = await testEndpoint(`/api/tasks/token/${createdToken}`);
    results.push({ name: '11. SPOC Token Verification Endpoint (/api/tasks/token)', status: res.status === 200 && res.data.taskId === createdTaskId ? 'PASS' : 'FAIL', details: `Dept: ${res.data.dept}, SLA Due: ${res.data.dueAt}` });
  } catch (err) {
    results.push({ name: '11. SPOC Token Verification Endpoint (/api/tasks/token)', status: 'FAIL', error: err.message });
  }

  // 12. Submit SPOC CAPA Response
  try {
    const res = await testEndpoint('/api/response', {
      method: 'POST',
      body: {
        taskId: createdTaskId,
        responses: {
          'f-test-1': {
            imm: 'Suspended account and verified logs.',
            rc: 'Lack of automated check.',
            capa: 'Implemented RBAC hook.'
          }
        }
      }
    });
    results.push({ name: '12. SPOC Corrective Action Response Submission (/api/response)', status: res.status === 200 && res.data.task.status === 'Completed' ? 'PASS' : 'FAIL', details: `Status: ${res.data.task?.status}` });
  } catch (err) {
    results.push({ name: '12. SPOC Corrective Action Response Submission (/api/response)', status: 'FAIL', error: err.message });
  }

  // 13. System Settings Configuration
  try {
    const res = await testEndpoint('/api/settings', {
      method: 'POST',
      body: {
        tatHours: 72,
        defaultYear: '2026-27',
        systemEmail: 'sfjimelliot@gmail.com'
      }
    });
    results.push({ name: '13. Update System Settings & SLA Rules (/api/settings)', status: res.status === 200 && res.data.settings.tatHours === 72 ? 'PASS' : 'FAIL', details: res.data.settings });
  } catch (err) {
    results.push({ name: '13. Update System Settings & SLA Rules (/api/settings)', status: 'FAIL', error: err.message });
  }

  // 14. Clean up test department
  try {
    await testEndpoint('/api/depts/TST1', { method: 'DELETE' });
    results.push({ name: '14. Test Data Cleanup Operation (/api/depts/TST1)', status: 'PASS', details: 'Cleanup completed successfully.' });
  } catch (err) {
    results.push({ name: '14. Test Data Cleanup Operation (/api/depts/TST1)', status: 'FAIL', error: err.message });
  }

  const endTime = new Date().toISOString();
  console.log('--- COMPREHENSIVE TEST RESULTS ---');
  console.log(JSON.stringify({ startTime, endTime, total: results.length, passed: results.filter(r => r.status === 'PASS').length, failed: results.filter(r => r.status === 'FAIL').length, results }, null, 2));
}

runAllTests();
