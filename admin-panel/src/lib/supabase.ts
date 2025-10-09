import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we have valid Supabase configuration
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here' || supabaseKey === 'your_supabase_anon_key_here') {
    // Return a comprehensive mock client for development when Supabase is not configured
    const mockQueryBuilder = {
      select: () => mockQueryBuilder,
      insert: () => mockQueryBuilder,
      update: () => mockQueryBuilder,
      delete: () => mockQueryBuilder,
      eq: () => mockQueryBuilder,
      gte: () => mockQueryBuilder,
      lte: () => mockQueryBuilder,
      gt: () => mockQueryBuilder,
      lt: () => mockQueryBuilder,
      order: () => mockQueryBuilder,
      limit: () => mockQueryBuilder,
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null })
    }

    return {
      from: () => mockQueryBuilder,
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null })
      }
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}