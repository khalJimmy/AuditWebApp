import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USERS,
  INITIAL_DEPTS,
  INITIAL_SETTINGS,
  INITIAL_PLANS,
  INITIAL_AUDITS,
  INITIAL_TASKS,
  h6
} from './src/data/mockData';
import { User, Department, AuditReport, AuditPlan, AuditTask, SystemSettings } from './src/types';

// In-memory Database state initialized with mock DB data
let users: User[] = [...INITIAL_USERS];
let depts: Department[] = [...INITIAL_DEPTS];
let settings: SystemSettings = { ...INITIAL_SETTINGS };
let plans: AuditPlan[] = [...INITIAL_PLANS];
let audits: AuditReport[] = [...INITIAL_AUDITS];
let tasks: AuditTask[] = [...INITIAL_TASKS];

export interface DailyUsageLog {
  date: string;
  reads: number;
  writes: number;
  deletes: number;
  egressMb: number;
}

let usageLogs: Record<string, DailyUsageLog> = {};

function generateSeedUsageLogs(): Record<string, DailyUsageLog> {
  const result: Record<string, DailyUsageLog> = {};
  const today = new Date();
  
  const seedData = [
    { offset: 6, reads: 12450, writes: 2840, deletes: 310, egressMb: 24.5 },
    { offset: 5, reads: 14890, writes: 3120, deletes: 420, egressMb: 28.2 },
    { offset: 4, reads: 18200, writes: 4250, deletes: 580, egressMb: 35.8 },
    { offset: 3, reads: 11300, writes: 1980, deletes: 210, egressMb: 19.4 },
    { offset: 2, reads: 16750, writes: 3890, deletes: 490, egressMb: 31.6 },
    { offset: 1, reads: 19420, writes: 4890, deletes: 620, egressMb: 38.9 },
    { offset: 0, reads: 15320, writes: 3640, deletes: 410, egressMb: 29.8 }
  ];

  seedData.forEach(item => {
    const d = new Date(today);
    d.setDate(d.getDate() - item.offset);
    const dateStr = d.toISOString().split('T')[0];
    result[dateStr] = {
      date: dateStr,
      reads: item.reads,
      writes: item.writes,
      deletes: item.deletes,
      egressMb: item.egressMb
    };
  });

  return result;
}

const dbFilePath = path.join(process.cwd(), 'src', 'data', 'mockDb.json');

function loadDbFromDisk() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.users) && data.users.length > 0) users = data.users;
      if (Array.isArray(data.departments) && data.departments.length > 0) depts = data.departments;
      if (Array.isArray(data.plans)) plans = data.plans;
      if (Array.isArray(data.audits)) audits = data.audits;
      if (Array.isArray(data.tasks)) tasks = data.tasks;
      if (data.settings) settings = data.settings;
      if (data.usageLogs && typeof data.usageLogs === 'object') {
        usageLogs = data.usageLogs;
      } else {
        usageLogs = generateSeedUsageLogs();
      }
      console.log(`[DB] Successfully loaded mockDb.json with ${users.length} users, ${depts.length} depts, ${plans.length} plans`);
    } else {
      usageLogs = generateSeedUsageLogs();
    }
  } catch (err) {
    console.error('[DB] Error reading mockDb.json, using fallback data:', err);
    usageLogs = generateSeedUsageLogs();
  }
}

function saveDbToDisk() {
  try {
    const data = {
      users,
      departments: depts,
      plans,
      audits,
      tasks,
      settings,
      usageLogs
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing to mockDb.json:', err);
  }
}

// Load DB immediately
loadDbFromDisk();

let nextAuditSeq = 2;
let nextPlanSeq = 3;
let nextTaskSeq = 2;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Request logger & Spark Usage Tracker middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
      
      if (req.path !== '/api/metrics/usage' && req.path !== '/api/health') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (!usageLogs[todayStr]) {
          usageLogs[todayStr] = {
            date: todayStr,
            reads: 0,
            writes: 0,
            deletes: 0,
            egressMb: 0
          };
        }
        
        if (req.method === 'GET') {
          usageLogs[todayStr].reads += 1;
          usageLogs[todayStr].egressMb += 0.08;
        } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          usageLogs[todayStr].writes += 1;
          usageLogs[todayStr].egressMb += 0.15;
        } else if (req.method === 'DELETE') {
          usageLogs[todayStr].deletes += 1;
          usageLogs[todayStr].egressMb += 0.05;
        }
      }
    }
    next();
  });

  // --------------------------------------------------------------------------
  // REST API ROUTES
  // --------------------------------------------------------------------------

  // Healthcheck
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AUTH: Login
  app.post('/api/auth/login', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const hashedPw = h6(password);
      const found = users.find(u => u.username === username && (u.pw === hashedPw || u.pw === password));

      if (!found) {
        res.status(401).json({ error: 'Invalid credentials. Please check your username or password.' });
        return;
      }

      const { pw, ...userWithoutPw } = found;
      const token = `token-${found.id}-${Date.now()}`;
      res.json({ token, user: userWithoutPw });
    } catch (err) {
      next(err);
    }
  });

  // AUTH: Me
  app.get('/api/auth/me', (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const token = authHeader.replace('Bearer ', '');
      const parts = token.split('-');
      const userId = parts[1];
      const found = users.find(u => u.id === userId);
      if (!found) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      const { pw, ...userWithoutPw } = found;
      res.json({ user: userWithoutPw });
    } catch (err) {
      next(err);
    }
  });

  // DEPARTMENTS: List
  app.get('/api/depts', (_req: Request, res: Response) => {
    res.json(depts);
  });

  // DEPARTMENTS: Save/Update
  app.post('/api/depts', (req: Request, res: Response, next: NextFunction) => {
    try {
      const d: Department = req.body;
      if (!d.ref || !d.dept || !d.fn) {
        res.status(400).json({ error: 'Ref, Department name, and Function are required.' });
        return;
      }
      const existingIdx = depts.findIndex(item => item.ref === d.ref);
      if (existingIdx >= 0) {
        depts[existingIdx] = { ...depts[existingIdx], ...d };
      } else {
        depts.push(d);
        depts.sort((a, b) => a.ref.localeCompare(b.ref));
      }
      res.json({ success: true, department: d, total: depts.length });
    } catch (err) {
      next(err);
    }
  });

  // DEPARTMENTS: Delete
  app.delete('/api/depts/:ref', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ref } = req.params;
      depts = depts.filter(d => d.ref !== ref);
      res.json({ success: true, deletedRef: ref });
    } catch (err) {
      next(err);
    }
  });

  // DEPARTMENTS: Import CSV
  app.post('/api/depts/import', (req: Request, res: Response, next: NextFunction) => {
    try {
      const imported: Department[] = req.body || [];
      let added = 0;
      let skipped = 0;
      imported.forEach(item => {
        if (!item.ref || !item.dept || !item.fn) {
          skipped++;
          return;
        }
        if (depts.find(d => d.ref === item.ref)) {
          skipped++;
          return;
        }
        depts.push(item);
        added++;
      });
      depts.sort((a, b) => a.ref.localeCompare(b.ref));
      res.json({ success: true, added, skipped, total: depts.length });
    } catch (err) {
      next(err);
    }
  });

  // USERS: List
  app.get('/api/users', (_req: Request, res: Response) => {
    const safeUsers = users.map(({ pw, ...u }) => u);
    res.json(safeUsers);
  });

  // USERS: Save / Update
  app.post('/api/users', (req: Request, res: Response, next: NextFunction) => {
    try {
      const u: User & { password?: string } = req.body;
      const userPw = u.pw || u.password;
      if (!u.name || !u.username) {
        res.status(400).json({ error: 'Name and Username are required.' });
        return;
      }

      const existingIdx = users.findIndex(item => item.id === u.id || item.username === u.username);
      if (existingIdx >= 0) {
        const current = users[existingIdx];
        users[existingIdx] = {
          ...current,
          ...u,
          pw: userPw ? h6(userPw) : current.pw
        };
      } else {
        if (!userPw) {
          res.status(400).json({ error: 'Password is required for new users.' });
          return;
        }
        const newUser: User = {
          ...u,
          id: u.id || `u${Date.now()}`,
          pw: h6(userPw)
        };
        users.push(newUser);
      }
      res.json({ success: true, user: u });
    } catch (err) {
      next(err);
    }
  });

  // USERS: Delete
  app.delete('/api/users/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      users = users.filter(u => u.id !== id);
      res.json({ success: true, deletedId: id });
    } catch (err) {
      next(err);
    }
  });

  // AUDITS: List
  app.get('/api/audits', (_req: Request, res: Response) => {
    res.json(audits);
  });

  // AUDITS: Submit
  app.post('/api/audits', (req: Request, res: Response, next: NextFunction) => {
    try {
      const audit: AuditReport = req.body;
      if (!audit.ref || !audit.auditDate || !audit.auditor) {
        res.status(400).json({ error: 'Ref, Audit Date, and Auditor are required.' });
        return;
      }

      if (!audit.auditId) {
        const pad = (n: number, len = 3) => String(n).padStart(len, '0');
        const d = new Date();
        audit.auditId = `AUD-${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(nextAuditSeq++)}`;
      }

      const existingIdx = audits.findIndex(a => a.auditId === audit.auditId);
      if (existingIdx >= 0) {
        audits[existingIdx] = audit;
      } else {
        audits.push(audit);
      }

      // Automatically update plan status if linked by planId or matching ref
      if (audit.planId) {
        const p = plans.find(item => item.planId === audit.planId);
        if (p) p.status = 'COMPLETED';
      } else {
        const matchedPlan = plans.find(p => p.ref === audit.ref && (p.status === 'Scheduled' || p.status === 'YET TO AUDIT'));
        if (matchedPlan) {
          matchedPlan.status = 'COMPLETED';
        }
      }

      res.json({ success: true, audit });
    } catch (err) {
      next(err);
    }
  });

  // PLANS: List
  app.get('/api/plans', (_req: Request, res: Response) => {
    res.json(plans);
  });

  // PLANS: Create or Update
  app.post('/api/plans', (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan: Partial<AuditPlan> & { date?: string } = req.body;

      if (plan.planId) {
        const existingIdx = plans.findIndex(p => p.planId === plan.planId);
        if (existingIdx >= 0) {
          const planDate = plan.planDate || plan.date || plans[existingIdx].planDate;
          let month = plan.month || plans[existingIdx].month;
          if (!month && planDate) {
            const d = new Date(planDate);
            if (!isNaN(d.getTime())) {
              const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              month = months[d.getMonth()];
            }
          }
          plans[existingIdx] = {
            ...plans[existingIdx],
            ...plan,
            planDate,
            date: planDate,
            month: month || 'August'
          };
          res.json({ success: true, plan: plans[existingIdx] });
          return;
        }
      }

      const planDate = plan.planDate || plan.date;
      if (!plan.ref || !planDate) {
        res.status(400).json({ error: 'Ref and Planned Date are required for new plans.' });
        return;
      }

      let month = plan.month;
      if (!month && planDate) {
        const d = new Date(planDate);
        if (!isNaN(d.getTime())) {
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          month = months[d.getMonth()];
        }
      }

      const pad = (n: number) => String(n).padStart(3, '0');
      const newPlan: AuditPlan = {
        planId: plan.planId || `PLN-${pad(nextPlanSeq++)}`,
        ref: plan.ref,
        dept: plan.dept || '',
        fn: plan.fn || '',
        month: month || 'August',
        planDate: planDate,
        date: planDate,
        status: plan.status || 'Scheduled',
        auditor: plan.auditor || '',
        spocMail: plan.spocMail || '',
        hodMail: plan.hodMail || '',
        type: plan.type || 'Plan',
        zone: plan.zone || 'Chennai',
        remarks: plan.notes || plan.remarks || ''
      };

      plans.push(newPlan);
      res.json({ success: true, plan: newPlan });
    } catch (err) {
      next(err);
    }
  });

  // PLANS: Delete
  app.delete('/api/plans/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      plans = plans.filter(p => p.planId !== id);
      res.json({ success: true, deletedPlanId: id });
    } catch (err) {
      next(err);
    }
  });

  // TASKS: List
  app.get('/api/tasks', (_req: Request, res: Response) => {
    res.json(tasks);
  });

  // TASKS: Get by Token
  app.get('/api/tasks/token/:token', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const task = tasks.find(t => t.token === token);
      if (!task) {
        res.status(404).json({ error: 'Task not found or link expired.' });
        return;
      }
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  // DISPATCH AUDIT (Create Task)
  app.post('/api/dispatch', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auditId, spocMail, hodMail } = req.body;
      const audit = audits.find(a => a.auditId === auditId);
      if (!audit) {
        res.status(404).json({ error: 'Audit report not found.' });
        return;
      }

      const pad = (n: number) => String(n).padStart(3, '0');
      const taskId = `TSK-${pad(nextTaskSeq++)}`;
      const token = Buffer.from(`${auditId}-${Date.now()}`).toString('hex').substring(0, 20);
      const dispatchedAt = new Date().toISOString();
      const dueAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

      const newTask: AuditTask = {
        taskId,
        auditId,
        dept: audit.dept,
        fn: audit.fn,
        spocName: audit.ref,
        spocMail: spocMail || audit.ref,
        hodMail: hodMail || '',
        token,
        dispatchedAt,
        dueAt,
        findings: [...audit.findings],
        status: 'Notified',
        reminderCount: 0,
        response: {}
      };

      tasks.push(newTask);
      audit.status = 'Dispatched';

      res.json({ success: true, task: newTask });
    } catch (err) {
      next(err);
    }
  });

  // RESPONSE: Submit SPOC response
  app.post('/api/response', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taskId, token, responses } = req.body;
      let task = tasks.find(t => (token && t.token === token) || (taskId && t.taskId === taskId));
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      task.response = responses || {};
      task.status = 'Completed';
      task.respondedAt = new Date().toISOString();

      // Update finding records in task and audit report
      if (responses) {
        task.findings.forEach(f => {
          if (responses[f.id]) {
            if (responses[f.id].imm) f.imm = responses[f.id].imm;
            if (responses[f.id].rc) f.rc = responses[f.id].rc;
            if (responses[f.id].capa) f.capa = responses[f.id].capa;
            if (responses[f.id].mitigation) f.mitigation = responses[f.id].mitigation;
          }
        });
      }

      res.json({ success: true, task });
    } catch (err) {
      next(err);
    }
  });

  // TASK: Send Reminder
  app.post('/api/tasks/:id/reminder', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const task = tasks.find(t => t.taskId === id || t.auditId === id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      task.reminderCount = (task.reminderCount || 0) + 1;
      res.json({ success: true, reminderCount: task.reminderCount });
    } catch (err) {
      next(err);
    }
  });

  // TASK: Close
  app.post('/api/tasks/:id/close', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const task = tasks.find(t => t.taskId === id || t.auditId === id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }
      task.status = 'Closed';
      task.closedAt = new Date().toISOString();
      res.json({ success: true, task });
    } catch (err) {
      next(err);
    }
  });

  // SETTINGS: Get
  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json(settings);
  });

  // SETTINGS: Save
  app.post('/api/settings', (req: Request, res: Response, next: NextFunction) => {
    try {
      settings = { ...settings, ...req.body };
      res.json({ success: true, settings });
    } catch (err) {
      next(err);
    }
  });

  // FIREBASE SPARK PLAN USAGE METRICS & ANALYTICS
  app.get('/api/metrics/usage', (_req: Request, res: Response, next: NextFunction) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLog = usageLogs[todayStr] || {
        date: todayStr,
        reads: 15320,
        writes: 3640,
        deletes: 410,
        egressMb: 29.8
      };

      // Free Spark Plan Rate Limits
      const sparkLimits = {
        readsDaily: 50000,
        writesDaily: 20000,
        deletesDaily: 20000,
        storageMb: 1024, // 1 GB
        egressMbMonth: 10240 // 10 GB
      };

      // Calculate current storage in MB based on in-memory collections
      const totalDbJsonStr = JSON.stringify({ users, depts, plans, audits, tasks, settings });
      const currentStorageMb = Math.max(12.4, +(Buffer.byteLength(totalDbJsonStr, 'utf-8') / (1024 * 1024) + 24.8).toFixed(2));

      // Calculate daily history sorted by date
      const dailyList = Object.values(usageLogs)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);

      // Analytics calculation
      const totalDays = Math.max(1, dailyList.length);
      const avgReads = Math.round(dailyList.reduce((acc, curr) => acc + curr.reads, 0) / totalDays);
      const avgWrites = Math.round(dailyList.reduce((acc, curr) => acc + curr.writes, 0) / totalDays);

      const readCapacityPercent = +((todayLog.reads / sparkLimits.readsDaily) * 100).toFixed(1);
      const writeCapacityPercent = +((todayLog.writes / sparkLimits.writesDaily) * 100).toFixed(1);
      const storageCapacityPercent = +((currentStorageMb / sparkLimits.storageMb) * 100).toFixed(1);

      let quotaStatus: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
      if (readCapacityPercent > 90 || writeCapacityPercent > 90) quotaStatus = 'Critical';
      else if (readCapacityPercent > 70 || writeCapacityPercent > 70) quotaStatus = 'Warning';

      res.json({
        sparkLimits,
        today: todayLog,
        currentStorageMb,
        dailyLogs: dailyList,
        analytics: {
          peakWindow: '10:00 AM - 01:30 PM IST',
          avgReadsPerDay: avgReads,
          avgWritesPerDay: avgWrites,
          quotaStatus,
          throttledRequests: 0,
          readCapacityPercent,
          writeCapacityPercent,
          storageCapacityPercent
        }
      });
    } catch (err) {
      next(err);
    }
  });

  // DOCS: File Hierarchy Flow Tree & SOP Rules Policy
  app.get('/api/docs/hierarchy', (_req: Request, res: Response, next: NextFunction) => {
    try {
      const filePath = path.join(process.cwd(), 'FILE_HIERARCHY.md');
      if (fs.existsSync(filePath)) {
        res.type('text/markdown').send(fs.readFileSync(filePath, 'utf-8'));
      } else {
        res.status(404).json({ error: 'FILE_HIERARCHY.md not found' });
      }
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/docs/sop', (_req: Request, res: Response, next: NextFunction) => {
    try {
      const filePath = path.join(process.cwd(), 'AUDIT_POLICY_SOP_RULES.md');
      if (fs.existsSync(filePath)) {
        res.type('text/markdown').send(fs.readFileSync(filePath, 'utf-8'));
      } else {
        res.status(404).json({ error: 'AUDIT_POLICY_SOP_RULES.md not found' });
      }
    } catch (err) {
      next(err);
    }
  });

  // --------------------------------------------------------------------------
  // ERROR HANDLING MIDDLEWARE
  // --------------------------------------------------------------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(err.status || 500).json({
      error: err.message || 'An unexpected error occurred on the server.',
      status: err.status || 500
    });
  });

  // --------------------------------------------------------------------------
  // VITE / STATIC MIDDLEWARE
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Casagrand Process Audit App running on http://localhost:${PORT}`);
  });
}

startServer();
