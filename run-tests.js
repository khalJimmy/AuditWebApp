import http from 'http';

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
  console.log('\n======================================================');
  console.log('🚀 RUNNING INTEGRATION & API QUALITY VERIFICATION');
  console.log('======================================================\n');
  const results = [];

  // 1. Healthcheck
  try {
    const health = await testEndpoint('/api/health');
    const pass = health.status === 200 && health.data?.status === 'ok';
    results.push({ name: 'GET /api/health', status: pass ? 'PASS' : 'FAIL', details: health.data });
    console.log(`  ${pass ? '✅' : '❌'} GET /api/health: ${health.data?.status || health.status}`);
  } catch (err) {
    results.push({ name: 'GET /api/health', status: 'FAIL', error: err.message });
    console.log(`  ❌ GET /api/health: ${err.message}`);
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
      results.push({ name: 'POST /api/auth/login (Admin)', status: 'PASS', details: `Token acquired, Role: ${login.data.user.role}` });
      console.log(`  ✅ POST /api/auth/login (Admin): Authorized as ${login.data.user.role}`);
    } else {
      results.push({ name: 'POST /api/auth/login (Admin)', status: 'FAIL', details: login.data });
      console.log(`  ❌ POST /api/auth/login (Admin): Failed status ${login.status}`);
    }
  } catch (err) {
    results.push({ name: 'POST /api/auth/login (Admin)', status: 'FAIL', error: err.message });
  }

  // 3. Auth Login (Auditor 1 - Chennai)
  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'auditor1', password: 'Audit@2026' }
    });
    const pass = login.status === 200 && login.data?.user?.zone === 'Chennai';
    results.push({ name: 'POST /api/auth/login (Auditor Chennai)', status: pass ? 'PASS' : 'FAIL', details: `Zone: ${login.data?.user?.zone}` });
    console.log(`  ${pass ? '✅' : '❌'} POST /api/auth/login (Auditor Chennai): Zone ${login.data?.user?.zone}`);
  } catch (err) {
    results.push({ name: 'POST /api/auth/login (Auditor Chennai)', status: 'FAIL', error: err.message });
  }

  // 4. Security Check: Invalid Login Rejection
  try {
    const badLogin = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'wrongpassword' }
    });
    const pass = badLogin.status === 401;
    results.push({ name: 'POST /api/auth/login (Security Reject Invalid Credentials)', status: pass ? 'PASS' : 'FAIL', details: `Status ${badLogin.status}` });
    console.log(`  ${pass ? '✅' : '❌'} Security: Invalid login rejected with 401`);
  } catch (err) {
    results.push({ name: 'POST /api/auth/login (Security Reject)', status: 'FAIL', error: err.message });
  }

  // 5. Fetch Departments
  try {
    const depts = await testEndpoint('/api/depts');
    const pass = depts.status === 200 && Array.isArray(depts.data) && depts.data.length > 0;
    results.push({ name: 'GET /api/depts', status: pass ? 'PASS' : 'FAIL', details: `Total Departments: ${depts.data?.length}` });
    console.log(`  ${pass ? '✅' : '❌'} GET /api/depts: ${depts.data?.length} departments cataloged`);
  } catch (err) {
    results.push({ name: 'GET /api/depts', status: 'FAIL', error: err.message });
  }

  // 6. Fetch Users
  try {
    const users = await testEndpoint('/api/users');
    const pass = users.status === 200 && Array.isArray(users.data) && users.data.length > 0;
    results.push({ name: 'GET /api/users', status: pass ? 'PASS' : 'FAIL', details: `Total Users: ${users.data?.length}` });
    console.log(`  ${pass ? '✅' : '❌'} GET /api/users: ${users.data?.length} active users`);
  } catch (err) {
    results.push({ name: 'GET /api/users', status: 'FAIL', error: err.message });
  }

  // 7. Fetch Plans
  try {
    const plans = await testEndpoint('/api/plans');
    const pass = plans.status === 200 && Array.isArray(plans.data);
    results.push({ name: 'GET /api/plans', status: pass ? 'PASS' : 'FAIL', details: `Total Audit Plans: ${plans.data?.length}` });
    console.log(`  ${pass ? '✅' : '❌'} GET /api/plans: ${plans.data?.length} plans retrieved`);
  } catch (err) {
    results.push({ name: 'GET /api/plans', status: 'FAIL', error: err.message });
  }

  // 8. Fetch Audits
  try {
    const audits = await testEndpoint('/api/audits');
    const pass = audits.status === 200 && Array.isArray(audits.data);
    results.push({ name: 'GET /api/audits', status: pass ? 'PASS' : 'FAIL', details: `Total Audit Reports: ${audits.data?.length}` });
    console.log(`  ${pass ? '✅' : '❌'} GET /api/audits: ${audits.data?.length} audit records`);
  } catch (err) {
    results.push({ name: 'GET /api/audits', status: 'FAIL', error: err.message });
  }

  // 9. Fetch Tasks
  try {
    const tasks = await testEndpoint('/api/tasks');
    const pass = tasks.status === 200 && Array.isArray(tasks.data);
    results.push({ name: 'GET /api/tasks', status: pass ? 'PASS' : 'FAIL', details: `Total Dispatched Tasks: ${tasks.data?.length}` });
    console.log(`  ${pass ? '✅' : '❌'} GET /api/tasks: ${tasks.data?.length} tasks monitored`);
  } catch (err) {
    results.push({ name: 'GET /api/tasks', status: 'FAIL', error: err.message });
  }

  // 10. Fetch Settings (TAT Hours and Resend/SMTP Configs)
  try {
    const settings = await testEndpoint('/api/settings');
    const pass = settings.status === 200 && settings.data?.tatHours === 72 && Array.isArray(settings.data?.smtpServers);
    results.push({ name: 'GET /api/settings', status: pass ? 'PASS' : 'FAIL', details: `TAT: ${settings.data?.tatHours}h, Configs: ${settings.data?.smtpServers?.length}` });
    console.log(`  ${pass ? '✅' : '❌'} GET /api/settings: TAT ${settings.data?.tatHours}h, ${settings.data?.smtpServers?.length} delivery configs`);
  } catch (err) {
    results.push({ name: 'GET /api/settings', status: 'FAIL', error: err.message });
  }

  // 11. Test Outbound Delivery Validation (Resend API mode without key gracefully handled)
  try {
    const testResend = await testEndpoint('/api/email/test-smtp', {
      method: 'POST',
      body: {
        smtpConfig: {
          id: 'test_resend',
          name: 'Resend Test Config',
          provider: 'resend',
          apiKey: '',
          fromEmail: 'onboarding@resend.dev'
        }
      }
    });
    // Expected status 400 because API key is empty
    const pass = testResend.status === 400 && testResend.data?.error?.includes('API Key');
    results.push({ name: 'POST /api/email/test-smtp (Resend Validation)', status: pass ? 'PASS' : 'FAIL', details: testResend.data?.error });
    console.log(`  ${pass ? '✅' : '❌'} Resend API Validation: Handled gracefully when key missing`);
  } catch (err) {
    results.push({ name: 'POST /api/email/test-smtp', status: 'FAIL', error: err.message });
  }

  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = total - passed;

  console.log('\n======================================================');
  console.log(`📊 INTEGRATION RESULTS: ${passed}/${total} PASSED (${failed === 0 ? '100% EXCELLENT' : `${failed} FAILED`})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();

