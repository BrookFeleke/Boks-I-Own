/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Deep fallback default credentials supplied for immediate zero-config connection
const FALLBACK_URL = 'https://nhbinxxxstgzfhxigksz.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oYmlueHh4c3RnemZoeGlna3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTcyNjQsImV4cCI6MjA5NjQ5MzI2NH0.XrKCPdJp_g50MbAyeZrKqnBHrc7oj-rRa_Okcj-wwro';

// Read from env, local storage, or use hardcoded persistent fallback
let rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
if (!rawUrl && typeof localStorage !== 'undefined') {
  rawUrl = localStorage.getItem('CUSTOM_SU_URL') || '';
}
if (!rawUrl) {
  rawUrl = FALLBACK_URL;
}

if (rawUrl) {
  rawUrl = rawUrl.trim();
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
  rawUrl = rawUrl.replace(/\/$/, '');
}

let rawKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();
if (!rawKey && typeof localStorage !== 'undefined') {
  rawKey = (localStorage.getItem('CUSTOM_SU_KEY') || '').trim();
}
if (!rawKey) {
  rawKey = FALLBACK_KEY;
}

export let SUPABASE_URL = rawUrl;
export let SUPABASE_ANON_KEY = rawKey;

export let isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export let supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseEnvProvided = !!((import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

export function initializeSupabase(url: string, key: string) {
  if (url && key) {
    SUPABASE_URL = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    SUPABASE_ANON_KEY = key.trim();
    isSupabaseConfigured = true;
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }
  return false;
}

if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('🔌 Supabase initialized on', SUPABASE_URL, 'Env provided:', isSupabaseEnvProvided);
  } else {
    console.warn('⚠️ Supabase credentials not found in environment or custom overrides.');
  }
}
