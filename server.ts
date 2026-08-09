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
      console.log(`[DB] Successfully loaded mockDb.json with ${users.length} users, ${depts.length} depts, ${plans.length} plans`);
    }
  } catch (err) {
    console.error('[DB] Error reading mockDb.json, using fallback data:', err);
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
      settings
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

  // Request logger middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
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
      const u: User = req.body;
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
          pw: u.pw ? h6(u.pw) : current.pw
        };
      } else {
        if (!u.pw) {
          res.status(400).json({ error: 'Password is required for new users.' });
          return;
        }
        const newUser: User = {
          ...u,
          id: u.id || `u${Date.now()}`,
          pw: h6(u.pw)
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
      const plan: AuditPlan = req.body;
      if (!plan.ref || !plan.month || !plan.planDate) {
        res.status(400).json({ error: 'Ref, Month, and Plan Date are required.' });
        return;
      }

      if (!plan.planId) {
        const pad = (n: number) => String(n).padStart(3, '0');
        plan.planId = `PLN-${pad(nextPlanSeq++)}`;
      }

      const existingIdx = plans.findIndex(p => p.planId === plan.planId);
      if (existingIdx >= 0) {
        plans[existingIdx] = plan;
      } else {
        plans.push(plan);
      }

      res.json({ success: true, plan });
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

  // DOCS: File Hierarchy Flow Tree & SOP Rules Policy
  app.get('/api/docs/hierarchy', (_req: Request, res: Response, next: NextFunction) => {
    try {
      const fs = require('fs');
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
      const fs = require('fs');
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
