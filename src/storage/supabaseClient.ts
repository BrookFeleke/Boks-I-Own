/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Read from env or local cache to survive environment gaps
let rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
if (!rawUrl && typeof localStorage !== 'undefined') {
  rawUrl = localStorage.getItem('CUSTOM_SU_URL') || '';
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
