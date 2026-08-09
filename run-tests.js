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
  console.log('--- STARTING COMPREHENSIVE SYSTEM TESTS ---');
  const results = [];

  // 1. Healthcheck
  try {
    const health = await testEndpoint('/api/health');
    results.push({ name: 'GET /api/health', status: health.status === 200 ? 'PASS' : 'FAIL', details: health.data });
  } catch (err) {
    results.push({ name: 'GET /api/health', status: 'FAIL', error: err.message });
  }

  // 2. Auth Login (Admin)
  let adminToken = '';
  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'admin', password: 'password123' }
    });
    if (login.status === 200 && login.data.token) {
      adminToken = login.data.token;
      results.push({ name: 'POST /api/auth/login (Admin)', status: 'PASS', details: `Token acquired, Role: ${login.data.user.role}` });
    } else {
      results.push({ name: 'POST /api/auth/login (Admin)', status: 'FAIL', details: login.data });
    }
  } catch (err) {
    results.push({ name: 'POST /api/auth/login (Admin)', status: 'FAIL', error: err.message });
  }

  // 3. Auth Login (Auditor 1 - Chennai)
  try {
    const login = await testEndpoint('/api/auth/login', {
      method: 'POST',
      body: { username: 'auditor1', password: 'password123' }
    });
    if (login.status === 200 && login.data.user.zone === 'Chennai') {
      results.push({ name: 'POST /api/auth/login (Auditor Chennai)', status: 'PASS', details: `Zone: ${login.data.user.zone}` });
    } else {
      results.push({ name: 'POST /api/auth/login (Auditor Chennai)', status: 'FAIL', details: login.data });
    }
  } catch (err) {
    results.push({ name: 'POST /api/auth/login (Auditor Chennai)', status: 'FAIL', error: err.message });
  }

  // 4. Fetch Departments
  try {
    const depts = await testEndpoint('/api/depts');
    results.push({ name: 'GET /api/depts', status: depts.status === 200 && Array.isArray(depts.data) ? 'PASS' : 'FAIL', details: `Total Departments: ${depts.data.length}` });
  } catch (err) {
    results.push({ name: 'GET /api/depts', status: 'FAIL', error: err.message });
  }

  // 5. Fetch Users
  try {
    const users = await testEndpoint('/api/users');
    results.push({ name: 'GET /api/users', status: users.status === 200 && Array.isArray(users.data) ? 'PASS' : 'FAIL', details: `Total Users: ${users.data.length}` });
  } catch (err) {
    results.push({ name: 'GET /api/users', status: 'FAIL', error: err.message });
  }

  // 6. Fetch Plans
  try {
    const plans = await testEndpoint('/api/plans');
    results.push({ name: 'GET /api/plans', status: plans.status === 200 && Array.isArray(plans.data) ? 'PASS' : 'FAIL', details: `Total Audit Plans: ${plans.data.length}` });
  } catch (err) {
    results.push({ name: 'GET /api/plans', status: 'FAIL', error: err.message });
  }

  // 7. Fetch Audits
  try {
    const audits = await testEndpoint('/api/audits');
    results.push({ name: 'GET /api/audits', status: audits.status === 200 && Array.isArray(audits.data) ? 'PASS' : 'FAIL', details: `Total Audit Reports: ${audits.data.length}` });
  } catch (err) {
    results.push({ name: 'GET /api/audits', status: 'FAIL', error: err.message });
  }

  // 8. Fetch Tasks
  try {
    const tasks = await testEndpoint('/api/tasks');
    results.push({ name: 'GET /api/tasks', status: tasks.status === 200 && Array.isArray(tasks.data) ? 'PASS' : 'FAIL', details: `Total Dispatched Tasks: ${tasks.data.length}` });
  } catch (err) {
    results.push({ name: 'GET /api/tasks', status: 'FAIL', error: err.message });
  }

  // 9. Fetch Settings
  try {
    const settings = await testEndpoint('/api/settings');
    results.push({ name: 'GET /api/settings', status: settings.status === 200 && settings.data.tatHours === 72 ? 'PASS' : 'FAIL', details: `TAT Hours: ${settings.data.tatHours}, Year: ${settings.data.defaultYear}` });
  } catch (err) {
    results.push({ name: 'GET /api/settings', status: 'FAIL', error: err.message });
  }

  console.log('--- TEST RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
}

runAllTests();
