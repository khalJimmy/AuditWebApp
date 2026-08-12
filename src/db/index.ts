import pkg from 'pg';
const { Pool } = pkg;

// Standard PostgreSQL & Supabase connection pool configuration
const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.SUPABASE_DATABASE_URL || 
  process.env.SUPABASE_DB_URL || 
  process.env.PGURI;

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
} else {
  console.log('[POSTGRESQL/SUPABASE] No DATABASE_URL provided. Running with in-memory state & automatic fallback.');
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
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(128) UNIQUE NOT NULL,
          password_hash VARCHAR(256) NOT NULL,
          name VARCHAR(256) NOT NULL,
          role VARCHAR(64) NOT NULL,
          zone VARCHAR(64) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_reports (
          audit_id VARCHAR(64) PRIMARY KEY,
          dept VARCHAR(256) NOT NULL,
          fn VARCHAR(256) NOT NULL,
          auditor VARCHAR(256) NOT NULL,
          audit_date DATE NOT NULL,
          score INTEGER NOT NULL,
          status VARCHAR(64) DEFAULT 'Dispatched',
          data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS action_tasks (
          task_id VARCHAR(64) PRIMARY KEY,
          audit_id VARCHAR(64) NOT NULL,
          token VARCHAR(128) UNIQUE NOT NULL,
          dept VARCHAR(256) NOT NULL,
          fn VARCHAR(256) NOT NULL,
          spoc_mail VARCHAR(256),
          hod_mail VARCHAR(256),
          dispatched_at TIMESTAMP NOT NULL,
          due_at TIMESTAMP NOT NULL,
          status VARCHAR(64) DEFAULT 'Pending',
          reminder_count INTEGER DEFAULT 0,
          data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS system_settings (
          id VARCHAR(32) PRIMARY KEY,
          system_email VARCHAR(256),
          tat_hours INTEGER DEFAULT 72,
          dispatch_template TEXT,
          reminder_template TEXT,
          data JSONB,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('[POSTGRESQL] Database Schema initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[POSTGRESQL] Error creating database schema:', err);
  }
}
