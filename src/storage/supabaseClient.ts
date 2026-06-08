/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Sanitize Supabase URL: strip trailing slashes or '/rest/v1/' routes
let rawUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
if (rawUrl) {
  rawUrl = rawUrl.trim();
  rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
  rawUrl = rawUrl.replace(/\/$/, '');
}

export const SUPABASE_URL = rawUrl;
export const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('🔌 Supabase initialized successfully on', SUPABASE_URL);
  } else {
    console.warn('⚠️ Supabase credentials missing; database adapter falling back to client localStorage.');
  }
}
