import pkg from 'pg';
const { Pool } = pkg;

// Standard PostgreSQL & Supabase connection pool configuration
const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.SUPABASE_DATABASE_URL || 
  process.env.SUPABASE_DB_URL || 
  process.env.PGURI;

const pgHost = process.env.PGHOST || process.env.SUPABASE_HOST;
const pgPort = parseInt(process.env.PGPORT || process.env.SUPABASE_PORT || '5432', 10);
const pgUser = process.env.PGUSER || process.env.SUPABASE_USER || 'postgres';
const pgPassword = process.env.PGPASSWORD || process.env.SUPABASE_PASSWORD;
const pgDatabase = process.env.PGDATABASE || process.env.SUPABASE_DATABASE || 'postgres';

let pool: pkg.Pool | null = null;

if (connectionString) {
  try {
    const isSupabase = connectionString.includes('supabase.co') || connectionString.includes('supabase.com');
    const isProduction = process.env.NODE_ENV === 'production';
    
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: (isProduction || isSupabase) ? { rejectUnauthorized: false } : undefined
    });

    pool.on('error', (err) => {
      console.error('[POSTGRESQL/SUPABASE POOL ERROR]', err.message);
    });

    console.log('[POSTGRESQL/SUPABASE] Pool initialized with database connection string.');
  } catch (err) {
    console.warn('[POSTGRESQL/SUPABASE] Failed to initialize connection pool:', err);
    pool = null;
  }
} else if (pgHost && pgPassword) {
  try {
    const isSupabase = pgHost.includes('supabase.co') || pgHost.includes('supabase.com');
    pool = new Pool({
      host: pgHost,
      port: pgPort,
      user: pgUser,
      password: pgPassword,
      database: pgDatabase,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      ssl: (process.env.NODE_ENV === 'production' || isSupabase) ? { rejectUnauthorized: false } : undefined
    });

    pool.on('error', (err) => {
      console.error('[POSTGRESQL/SUPABASE POOL ERROR]', err.message);
    });

    console.log(`[POSTGRESQL/SUPABASE] Pool initialized with direct host: ${pgHost}:${pgPort}/${pgDatabase}`);
  } catch (err) {
    console.warn('[POSTGRESQL/SUPABASE] Failed to initialize direct connection pool:', err);
    pool = null;
  }
} else {
  console.log('[POSTGRESQL/SUPABASE] No DATABASE_URL or PGHOST provided. Running with in-memory state & automatic fallback.');
}

export const db = {
  isConfigured: () => !!pool,
  query: async (text: string, params?: any[]) => {
    if (!pool) return null;
    return await pool.query(text, params);
  }
};

/**
 * Initialize PostgreSQL Schema tables if DATABASE_URL is active
 */
export async function initPostgresSchema() {
  if (!pool) return;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        -- Enable UUID extension if supported
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
          role VARCHAR(64) NOT NULL,
          zone VARCHAR(64) NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_role_zone ON users(role, zone);

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

        -- 3. AUDIT PLANS TABLE
        CREATE TABLE IF NOT EXISTS audit_plans (
          plan_id VARCHAR(64) PRIMARY KEY,
          dept VARCHAR(256) NOT NULL,
          fn VARCHAR(256) NOT NULL,
          zone VARCHAR(64) NOT NULL,
          auditor VARCHAR(256) NOT NULL,
          plan_date DATE NOT NULL,
          ref VARCHAR(64),
          spoc_mail VARCHAR(256),
          hod_mail VARCHAR(256),
          status VARCHAR(64) DEFAULT 'SCHEDULED',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_audit_plans_zone_status ON audit_plans(zone, status);

        -- 4. AUDIT REPORTS TABLE
        CREATE TABLE IF NOT EXISTS audit_reports (
          audit_id VARCHAR(64) PRIMARY KEY,
          dept VARCHAR(256) NOT NULL,
          fn VARCHAR(256) NOT NULL,
          auditor VARCHAR(256) NOT NULL,
          audit_date DATE NOT NULL,
          score INTEGER NOT NULL,
          status VARCHAR(64) DEFAULT 'Dispatched',
          data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_audit_reports_status ON audit_reports(status);

        -- 5. ACTION TASKS TABLE
        CREATE TABLE IF NOT EXISTS action_tasks (
          task_id VARCHAR(64) PRIMARY KEY,
          audit_id VARCHAR(64) NOT NULL,
          token VARCHAR(128) UNIQUE NOT NULL,
          dept VARCHAR(256) NOT NULL,
          fn VARCHAR(256) NOT NULL,
          spoc_mail VARCHAR(256),
          hod_mail VARCHAR(256),
          dispatched_at TIMESTAMPTZ NOT NULL,
          due_at TIMESTAMPTZ NOT NULL,
          status VARCHAR(64) DEFAULT 'Pending',
          reminder_count INTEGER DEFAULT 0,
          data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_action_tasks_token ON action_tasks(token);
        CREATE INDEX IF NOT EXISTS idx_action_tasks_due_status ON action_tasks(due_at, status);

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
      `);
      console.log('[POSTGRESQL/SUPABASE] Database Schema DDL initialized with indexes and triggers.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[POSTGRESQL/SUPABASE] Error creating database schema:', err);
  }
}
