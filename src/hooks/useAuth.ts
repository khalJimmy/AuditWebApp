import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { 
  supabase, 
  mapSupabaseUserToAppUser, 
  resolveLoginEmail, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { setApiAuthToken, api } from '../services/api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Synchronize Supabase session to React User state
  const syncUserFromSession = useCallback(async (sessionUser: any | null, accessToken?: string | null) => {
    if (!sessionUser) {
      setUser(null);
      setApiAuthToken(null);
      setAuthStatus('unauthenticated');
      return;
    }

    if (accessToken) {
      setApiAuthToken(accessToken);
    }

    try {
      // Check if backend API or database has extended profile
      let profileOverride: Partial<User> | null = null;
      try {
        const meRes = await api.getMe().catch(() => null);
        if (meRes?.user) {
          profileOverride = meRes.user;
        }
      } catch {
        // Fallback to Supabase metadata if API route is offline/unavailable
      }

      const mapped = mapSupabaseUserToAppUser(sessionUser, profileOverride);
      if (isMountedRef.current) {
        setUser(mapped);
        setAuthStatus('authenticated');
        setError(null);
      }
    } catch (err: any) {
      console.warn('[AUTH] Error mapping Supabase user, using default schema:', err);
      const mapped = mapSupabaseUserToAppUser(sessionUser);
      if (isMountedRef.current) {
        setUser(mapped);
        setAuthStatus('authenticated');
      }
    }
  }, []);

  // Initialize auth listener & check active session on mount
  useEffect(() => {
    isMountedRef.current = true;

    async function initAuth() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('[AUTH] Supabase session retrieval warning:', sessionError.message);
          if (isMountedRef.current) {
            setUser(null);
            setAuthStatus('unauthenticated');
          }
          return;
        }

        if (sessionData?.session?.user) {
          await syncUserFromSession(sessionData.session.user, sessionData.session.access_token);
        } else {
          if (isMountedRef.current) {
            setUser(null);
            setAuthStatus('unauthenticated');
          }
        }
      } catch (err: any) {
        console.error('[AUTH] Failed to initialize Supabase auth session:', err);
        if (isMountedRef.current) {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      }
    }

    initAuth();

    // Listen for auth state transitions (login, logout, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          await syncUserFromSession(session.user, session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMountedRef.current) {
          setUser(null);
          setApiAuthToken(null);
          setAuthStatus('unauthenticated');
        }
      }
    });

    return () => {
      isMountedRef.current = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [syncUserFromSession]);

  /**
   * Supabase Auth Login with email/username and password.
   * Handles format resolution, detailed error diagnostics, and session storage.
   */
  const login = async (identifier: string, pass: string): Promise<User> => {
    setError(null);

    if (!identifier || !pass) {
      const msg = 'Please enter both username/email and password.';
      setError(msg);
      throw new Error(msg);
    }

    const email = resolveLoginEmail(identifier);

    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (sbError) {
        // Detailed user-friendly mapping of Supabase Auth errors
        let userMessage = sbError.message;
        
        if (sbError.message.toLowerCase().includes('invalid login credentials')) {
          userMessage = `Invalid credentials for ${identifier}. Please verify your password or contact your administrator.`;
        } else if (sbError.message.toLowerCase().includes('email not confirmed')) {
          userMessage = 'Your email address has not been confirmed yet. Please verify your email or check Supabase Auth settings.';
        } else if (sbError.message.toLowerCase().includes('too many requests')) {
          userMessage = 'Too many failed login attempts. Please wait a few seconds before trying again.';
        } else if (sbError.message.toLowerCase().includes('fetch failed') || sbError.message.toLowerCase().includes('network')) {
          userMessage = 'Unable to reach the Supabase authentication server. Please check your internet connection.';
        }

        console.warn(`[SUPABASE AUTH ERROR] Status: ${sbError.status}, Message: ${sbError.message}`);
        setError(userMessage);
        throw new Error(userMessage);
      }

      if (!data.user) {
        const msg = 'Authentication completed but no user session was returned.';
        setError(msg);
        throw new Error(msg);
      }

      if (data.session?.access_token) {
        setApiAuthToken(data.session.access_token);
      }

      const appUser = mapSupabaseUserToAppUser(data.user);
      setUser(appUser);
      setAuthStatus('authenticated');
      return appUser;
    } catch (err: any) {
      if (!error) {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
      throw err;
    }
  };

  /**
   * Supabase Auth Sign Up for creating new accounts
   */
  const signUp = async (
    email: string, 
    pass: string, 
    metadata?: { name?: string; role?: string; zone?: string; username?: string }
  ) => {
    setError(null);
    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: metadata || {}
        }
      });

      if (sbError) {
        setError(sbError.message);
        throw new Error(sbError.message);
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  /**
   * Supabase Auth Password Reset Email
   */
  const resetPassword = async (emailOrUsername: string) => {
    setError(null);
    const email = resolveLoginEmail(emailOrUsername);
    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
      });

      if (sbError) {
        setError(sbError.message);
        throw new Error(sbError.message);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Password reset request failed');
      throw err;
    }
  };

  /**
   * Supabase Auth Sign Out
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AUTH] Error during Supabase signout:', err);
    } finally {
      setUser(null);
      setApiAuthToken(null);
      setAuthStatus('unauthenticated');
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('cpa_token');
          localStorage.removeItem('casagrand_supabase_auth_token');
        } catch {
          // ignore
        }
      }
    }
  };

  return {
    user,
    authStatus,
    loading: authStatus === 'loading',
    isAuthenticated: authStatus === 'authenticated',
    error,
    login,
    signUp,
    resetPassword,
    logout,
    isSupabaseConfigured: isSupabaseConfigured()
  };
}
