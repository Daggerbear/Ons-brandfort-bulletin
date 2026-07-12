import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xasiwsjeiblpikijurgm.supabase.co'
const supabaseKey = 'sb_publishable_XHC4J3jwBi-8xJGnJP-MxQ_mnZE_z9J'

export const supabase = createClient(supabaseUrl, supabaseKey)