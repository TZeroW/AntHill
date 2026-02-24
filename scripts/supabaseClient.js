const SUPABASE_URL = 'https://pdvzegwvhykiolqvdwur.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_34NY0eCoEoVRjAhatlxwMg_chSdh-Wc';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);