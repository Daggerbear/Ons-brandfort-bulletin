// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xasiwsjeiblpikijurgm.supabase.co'
const supabaseKey = 'sb_publishable_XHC4J3jwBi-8xJGnJP-MxQ_mnZE_z9J'

// Phase 1 auth: Google sign-in via the PKCE flow.
// - persistSession + autoRefreshToken keep people signed in across refreshes
// - detectSessionInUrl lets the client finish the Google redirect by itself
// Visitors who never sign in behave exactly as before (they stay the "anon" role).
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
