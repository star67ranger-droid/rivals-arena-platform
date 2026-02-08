import { createClient } from '@supabase/supabase-js';

// These should be in .env but for now we hardcode as requested
const SUPABASE_URL = 'https://reujuxwofqdjnwhgygqa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jA1yL5OJV3rKB5XRaeQHZQ_aYvxw5XG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
