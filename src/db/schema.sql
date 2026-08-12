-- Casagrand Process Audit System - Complete Supabase / PostgreSQL Schema DDL

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Automated Updated-At Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(128) UNIQUE NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  name VARCHAR(256) NOT NULL,
  role VARCHAR(64) NOT NULL CHECK (role IN ('admin', 'auditor', 'spoc', 'hod')),
  zone VARCHAR(64) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_zone ON users(role, zone);

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  ref VARCHAR(64) PRIMARY KEY,
  dept VARCHAR(256) NOT NULL,
  fn VARCHAR(256) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  spoc_name VARCHAR(256),
  spoc_mail VARCHAR(256),
  spoc_phone VARCHAR(64),
  hod_name VARCHAR(256),
  hod_mail VARCHAR(256),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_departments_dept_fn ON departments(dept, fn);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

DROP TRIGGER IF EXISTS set_departments_updated_at ON departments;
CREATE TRIGGER set_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 3. AUDIT PLANS TABLE
CREATE TABLE IF NOT EXISTS audit_plans (
  plan_id VARCHAR(64) PRIMARY KEY,
  dept VARCHAR(256) NOT NULL,
  fn VARCHAR(256) NOT NULL,
  zone VARCHAR(64) NOT NULL,
  auditor VARCHAR(256) NOT NULL,
  plan_date DATE NOT NULL,
  ref VARCHAR(64) REFERENCES departments(ref) ON DELETE SET NULL,
  spoc_mail VARCHAR(256),
  hod_mail VARCHAR(256),
  status VARCHAR(64) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_plans_zone_status ON audit_plans(zone, status);
CREATE INDEX IF NOT EXISTS idx_audit_plans_date ON audit_plans(plan_date);

DROP TRIGGER IF EXISTS set_audit_plans_updated_at ON audit_plans;
CREATE TRIGGER set_audit_plans_updated_at
BEFORE UPDATE ON audit_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 4. AUDIT REPORTS TABLE
CREATE TABLE IF NOT EXISTS audit_reports (
  audit_id VARCHAR(64) PRIMARY KEY,
  dept VARCHAR(256) NOT NULL,
  fn VARCHAR(256) NOT NULL,
  auditor VARCHAR(256) NOT NULL,
  audit_date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  status VARCHAR(64) DEFAULT 'Dispatched',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_reports_status ON audit_reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_reports_date ON audit_reports(audit_date);
CREATE INDEX IF NOT EXISTS idx_audit_reports_auditor ON audit_reports(auditor);

DROP TRIGGER IF EXISTS set_audit_reports_updated_at ON audit_reports;
CREATE TRIGGER set_audit_reports_updated_at
BEFORE UPDATE ON audit_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 5. ACTION TASKS TABLE (SPOC CAPA & SLA Tracker)
CREATE TABLE IF NOT EXISTS action_tasks (
  task_id VARCHAR(64) PRIMARY KEY,
  audit_id VARCHAR(64) NOT NULL REFERENCES audit_reports(audit_id) ON DELETE CASCADE,
  token VARCHAR(128) UNIQUE NOT NULL,
  dept VARCHAR(256) NOT NULL,
  fn VARCHAR(256) NOT NULL,
  spoc_mail VARCHAR(256),
  hod_mail VARCHAR(256),
  dispatched_at TIMESTAMPTZ NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(64) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Closed', 'Overdue')),
  reminder_count INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_action_tasks_token ON action_tasks(token);
CREATE INDEX IF NOT EXISTS idx_action_tasks_due_status ON action_tasks(due_at, status);
CREATE INDEX IF NOT EXISTS idx_action_tasks_audit_id ON action_tasks(audit_id);

DROP TRIGGER IF EXISTS set_action_tasks_updated_at ON action_tasks;
CREATE TRIGGER set_action_tasks_updated_at
BEFORE UPDATE ON action_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 6. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
  system_email VARCHAR(256),
  tat_hours INTEGER DEFAULT 72,
  dispatch_template TEXT,
  reminder_template TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS set_system_settings_updated_at ON system_settings;
CREATE TRIGGER set_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables for Supabase Security Compliance
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Permissive policies for server connection access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full access users') THEN
    CREATE POLICY "Allow service role full access users" ON users FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full access departments') THEN
    CREATE POLICY "Allow service role full access departments" ON departments FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full access audit_plans') THEN
    CREATE POLICY "Allow service role full access audit_plans" ON audit_plans FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full access audit_reports') THEN
    CREATE POLICY "Allow service role full access audit_reports" ON audit_reports FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full access action_tasks') THEN
    CREATE POLICY "Allow service role full access action_tasks" ON action_tasks FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service role full access system_settings') THEN
    CREATE POLICY "Allow service role full access system_settings" ON system_settings FOR ALL USING (true);
  END IF;
END $$;
