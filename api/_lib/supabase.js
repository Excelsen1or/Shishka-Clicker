import { createClient } from '@supabase/supabase-js'

export function createServerSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('missing_SUPABASE_URL')
  }

  if (!serviceRoleKey) {
    throw new Error('missing_SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}
