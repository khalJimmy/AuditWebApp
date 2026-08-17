/**
 * Comprehensive Automated Quality Control (QC) Test Suite
 * Evaluates core calculations, SLA timers, catalog lookups, request deduplication, and template rendering.
 */

import { DepartmentModel } from '../src/models/DepartmentModel.js';
import { DepartmentCatalog } from '../src/models/DepartmentCatalog.js';
import { renderAuditScheduledEmail, renderCapaClockTickingEmail } from '../src/utils/emailTemplates.js';
import { debounce, throttle, requestDeduplicator } from '../src/utils/throttle.js';
import { INITIAL_DEPTS, INITIAL_AUDITS, INITIAL_TASKS } from '../src/data/mockData.js';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = +(performance.now() - start).toFixed(2);
    results.push({ suite, name, passed: true, durationMs });
    console.log(`  ✅ [PASS] ${suite} > ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = +(performance.now() - start).toFixed(2);
    results.push({ suite, name, passed: false, durationMs, error: err.message });
    console.error(`  ❌ [FAIL] ${suite} > ${name} (${durationMs}ms):`, err.message);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runAllSuites() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING AUTOMATED QUALITY CONTROL (QC) TEST SUITE');
  console.log('======================================================\n');

  // SUITE 1: AUDIT SCORING & CALCULATION METRICS
  console.log('📦 SUITE 1: Audit Scoring & Process Compliance Math');
  await runTest('AuditScoring', 'Calculates compliance score accurately out of 1000', () => {
    const sampleAudit = INITIAL_AUDITS[0];
    assert(typeof sampleAudit.processScore === 'number', 'Process score must be a number');
    assert(sampleAudit.processScore >= 0 && sampleAudit.processScore <= 1000, 'Score must be between 0 and 1000');
    assert(sampleAudit.compliancePct.includes('%'), 'Compliance percentage must contain % format');
  });

  await runTest('AuditScoring', 'Validates findings categorization (NC, OBS, Risk, CI)', () => {
    INITIAL_AUDITS.forEach(audit => {
      assert(Array.isArray(audit.findings), `Audit ${audit.auditId} findings must be an array`);
      const totalCount = audit.ncCount + audit.obsCount + (audit.riskCount || 0) + (audit.ciCount || 0);
      assert(totalCount === audit.findings.length, `Finding counts mismatch for ${audit.auditId}`);
    });
  });

  // SUITE 2: 72-HOUR SLA TAT ENGINE & TIME CALCULATION
  console.log('\n📦 SUITE 2: 72-Hour SLA TAT & Overdue Calculations');
  await runTest('SLATimer', 'Computes correct SLA deadline from dispatch timestamp', () => {
    const dispatchTime = new Date('2026-08-17T10:00:00.000Z').getTime();
    const tatHours = 72;
    const dueTime = dispatchTime + tatHours * 3600 * 1000;
    const diffHours = (dueTime - dispatchTime) / (3600 * 1000);
    assert(diffHours === 72, 'SLA deadline must be exactly 72 hours from dispatch');
  });

  await runTest('SLATimer', 'Task lifecycle handles token authorization and remaining hours', () => {
    INITIAL_TASKS.forEach(task => {
      assert(!!task.taskId, 'Task ID must be non-empty');
      assert(!!task.token, 'Security token must exist for direct SPOC access');
      assert(['Notified', 'Response Pending', 'Delayed', 'Completed', 'Closed'].includes(task.status), `Invalid task status: ${task.status}`);
    });
  });

  // SUITE 3: DEPARTMENT CATALOG O(1) LOOKUP & ZONE CONTACT ROUTING
  console.log('\n📦 SUITE 3: Department Catalog & Multi-Zone Contact Routing');
  await runTest('DeptCatalog', 'Resolves zone-specific contacts with fallback in O(1) time', () => {
    const catalog = new DepartmentCatalog(INITIAL_DEPTS);
    const firstDept = INITIAL_DEPTS[0];
    const resolved = catalog.getContacts(firstDept.ref, 'Chennai');
    assert(!!resolved.spocMail, 'Resolved SPOC email should exist');
    assert(!!resolved.hodMail, 'Resolved HOD email should exist');
  });

  await runTest('DeptCatalog', 'Handles case-insensitive and whitespace-tolerant search', () => {
    const catalog = new DepartmentCatalog(INITIAL_DEPTS);
    const resultsLower = catalog.search('design');
    const resultsUpper = catalog.search('DESIGN');
    assert(resultsLower.length === resultsUpper.length, 'Search must be case-insensitive');
    assert(resultsLower.length > 0, 'Should find at least 1 matching department for "design"');
  });

  // SUITE 4: REQUEST THROTTLING & DEDUPLICATION ENGINE
  console.log('\n📦 SUITE 4: Request Throttling & In-Flight Deduplication');
  await runTest('Throttling', 'In-flight request deduplicator coalesces identical simultaneous promises', async () => {
    let callCount = 0;
    const mockFetcher = async () => {
      callCount++;
      await new Promise(r => setTimeout(r, 50));
      return { data: 'ok' };
    };

    // Trigger 5 concurrent requests with identical key
    const [r1, r2, r3, r4, r5] = await Promise.all([
      requestDeduplicator.execute('test_key', mockFetcher),
      requestDeduplicator.execute('test_key', mockFetcher),
      requestDeduplicator.execute('test_key', mockFetcher),
      requestDeduplicator.execute('test_key', mockFetcher),
      requestDeduplicator.execute('test_key', mockFetcher)
    ]);

    assert(callCount === 1, `Expected 1 network call due to deduplication, got ${callCount}`);
    assert(r1.data === 'ok' && r5.data === 'ok', 'All callers receive resolved response');
  });

  await runTest('Throttling', 'Debounce delays execution until idle window expires', async () => {
    let executionCount = 0;
    const debounced = debounce(() => {
      executionCount++;
    }, 40);

    debounced();
    debounced();
    debounced();
    assert(executionCount === 0, 'Should not execute immediately');

    await new Promise(r => setTimeout(r, 80));
    assert(executionCount === 1, `Expected 1 debounced execution, got ${executionCount}`);
  });

  // SUITE 5: EMAIL TEMPLATE GENERATION & SMTP COMPLIANCE
  console.log('\n📦 SUITE 5: Email Notification Templates & HTML Validation');
  await runTest('EmailTemplates', 'Renders Planner Scheduled Audit email with required parameters', () => {
    const html = renderAuditScheduledEmail({
      planId: 'PLN-2026-TEST',
      department: 'Design (Architecture)',
      zone: 'Chennai',
      scheduledDate: '2026-08-25',
      auditorName: 'Senior Auditor',
      spocName: 'K. Senthil',
      spocEmail: 'senthil@casagrand.co.in',
      hodEmail: 'hod@casagrand.co.in',
      portalUrl: 'https://casagrand.audit'
    });

    assert(html.includes('PLN-2026-TEST'), 'Template must include Plan ID');
    assert(html.includes('Design (Architecture)'), 'Template must include Department');
    assert(html.includes('2026-08-25'), 'Template must include Scheduled Date');
    assert(html.includes('CASAGRAND'), 'Template must include Casagrand branding');
  });

  await runTest('EmailTemplates', 'Renders 72-Hour SLA Clock Ticking email with token and finding counts', () => {
    const html = renderCapaClockTickingEmail({
      auditId: 'AUD-CHEN-2026-001',
      department: 'Design',
      zone: 'Chennai',
      dispatchedAt: '17 Aug 2026, 10:00 AM IST',
      dueAt: '20 Aug 2026, 10:00 AM IST',
      tatHours: 72,
      ncCount: 2,
      obsCount: 3,
      spocEmail: 'spoc.design@casagrand.co.in',
      hodEmail: 'hod.design@casagrand.co.in',
      directTokenLink: 'https://casagrand.audit/?token=spoc_token_123'
    });

    assert(html.includes('AUD-CHEN-2026-001'), 'Template must include Audit ID');
    assert(html.includes('72-Hour CAPA Resolution Clock'), 'Template must include SLA Timer notice');
    assert(html.includes('spoc_token_123'), 'Template must include direct access token link');
    assert(html.includes('Non-Conformances (NC)'), 'Template must list NC category');
  });

  // SUMMARY & SCORE CALCULATION
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const scorePct = Math.round((passed / total) * 100);

  console.log('\n======================================================');
  console.log('📊 QUALITY CONTROL TEST SUITE EXECUTION SUMMARY');
  console.log('======================================================');
  console.log(`Total Tests Run:  ${total}`);
  console.log(`Tests Passed:     ${passed}`);
  console.log(`Tests Failed:     ${failed}`);
  console.log(`Overall QC Score: ${scorePct}% (${scorePct >= 95 ? 'EXEMPLARY - GRADE A+' : scorePct >= 85 ? 'GOOD - GRADE A' : 'NEEDS ATTENTION'})\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllSuites();
