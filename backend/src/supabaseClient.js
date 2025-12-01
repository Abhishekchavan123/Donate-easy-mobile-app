const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('Missing SUPABASE_URL in environment variables.');
}

// Prefer service role key for server-side operations (allows bypassing RLS). If not present,
// fall back to anon key but note this may be blocked by Row-Level Security (RLS).
const keyToUse = supabaseServiceRole || supabaseAnonKey;
if (!keyToUse) {
  console.warn('Missing SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY - supabase client will not work.');
} else if (!supabaseServiceRole) {
  console.warn('Using ANON key on server. If updates are blocked, provide SUPABASE_SERVICE_ROLE_KEY for server-side writes.');
}

const supabase = createClient(supabaseUrl, keyToUse, {
  auth: {
    persistSession: false
  }
});

module.exports = { supabase };


