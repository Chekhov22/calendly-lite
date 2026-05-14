import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

// Server-only Supabase instance — обходит RLS, видит все bookings.
// Импортировать ТОЛЬКО в Route Handlers (app/api/*), никогда в 'use client'.
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
