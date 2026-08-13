import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, UserRole, ZoneName } from '../types';

// Client-side environment variables validation
// Vite exposes variables prefixed with VITE_ to client-side bundles
const envUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://mhxjydlzuvvgbqeepamd.supabase.co';

const envAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_5XmMPhwCe7aWaZJH0KUR7Q_y1ZxNWQb';

export const SUPABASE_URL: string = (envUrl || '').trim();
export const SUPABASE_ANON_KEY: string = (envAnonKey || '').trim();

/**
 * Validates whether the Supabase client has valid configuration without throwing exceptions.
 */
export function isSupabaseConfigured(): boolean {
  return (
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_URL.includes('.supabase.co') &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.length > 10
  );
}

/**
 * Returns developer-friendly configuration status for diagnostic checks.
 * Does NOT expose raw secret keys.
 */
export function getSupabaseConfigStatus(): {
  configured: boolean;
  urlHost: string;
  hasAnonKey: boolean;
  keyPrefix: string;
} {
  let urlHost = 'Not Configured';
  try {
    if (SUPABASE_URL) {
      const parsed = new URL(SUPABASE_URL);
      urlHost = parsed.host;
    }
  } catch {
    urlHost = 'Invalid URL Format';
  }

  return {
    configured: isSupabaseConfigured(),
    urlHost,
    hasAnonKey: Boolean(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 5),
    keyPrefix: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.slice(0, 8)}...` : 'None'
  };
}

// Dedicated Supabase Browser Client instance
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://mhxjydlzuvvgbqeepamd.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'casagrand_supabase_auth_token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
);

/**
 * Maps a Supabase Auth User object and optional database profile to our application User interface.
 */
export function mapSupabaseUserToAppUser(
  sbUser: SupabaseUser,
  profileOverride?: Partial<User> | null
): User {
  const metadata = sbUser.user_metadata || {};
  const email = sbUser.email || '';
  
  // Derive a fallback username from email if not in metadata
  const fallbackUsername = email ? email.split('@')[0] : `user-${sbUser.id.slice(0, 6)}`;
  
  const role: UserRole = (
    profileOverride?.role ||
    metadata.role ||
    (email.includes('admin') ? 'admin' : email.includes('auditor') ? 'auditor' : 'spoc')
  ) as UserRole;

  const zone: ZoneName | '' = (
    profileOverride?.zone !== undefined ? profileOverride.zone :
    metadata.zone !== undefined ? metadata.zone :
    (email.includes('cbe') || email.includes('coimbatore') ? 'Coimbatore' :
     email.includes('blr') || email.includes('bangalore') ? 'Bangalore' :
     email.includes('chn') || email.includes('chennai') ? 'Chennai' : '')
  ) as ZoneName | '';

  const name: string = 
    profileOverride?.name || 
    metadata.name || 
    metadata.full_name || 
    (email ? email.split('@')[0].replace(/\./g, ' ').toUpperCase() : 'Casagrand User');

  const username: string = 
    profileOverride?.username || 
    metadata.username || 
    fallbackUsername;

  const depts: string[] = 
    profileOverride?.depts || 
    metadata.depts || 
    (role === 'spoc' ? ['AA'] : []);

  return {
    id: sbUser.id,
    name,
    username,
    email,
    role,
    zone,
    depts,
    phone: profileOverride?.phone || metadata.phone || sbUser.phone || '',
    active: profileOverride?.active !== undefined ? profileOverride.active : true,
    lastLogin: sbUser.last_sign_in_at || new Date().toISOString()
  };
}

/**
 * Helper to normalize login inputs:
 * If the user types a username like "admin", converts to "admin@casagrand.co.in"
 * If the user types an email like "user@domain.com", keeps it as is.
 */
export function resolveLoginEmail(identifier: string): string {
  const trimmed = identifier.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Standard Casagrand enterprise domain convention
  return `${trimmed}@casagrand.co.in`;
}
