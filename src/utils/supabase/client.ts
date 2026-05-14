import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Client-side Supabase instance — подчиняется RLS-политикам.
// Может: INSERT в bookings, SELECT из services.
// Используется в Server Components и 'use client' компонентах.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
