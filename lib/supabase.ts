import { createClient } from '@supabase/supabase-js'
export function getSupabase(){const u=process.env.NEXT_PUBLIC_SUPABASE_URL;const k=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!u||!k)return null;return createClient(u,k)}
