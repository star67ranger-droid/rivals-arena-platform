import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co') as string;
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder') as string;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase Environment Variables are missing! App will likely fail requests.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
