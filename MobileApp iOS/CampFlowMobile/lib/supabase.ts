import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://qjomzeqfeghqkdjvjtxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb216ZXFmZWdocWtkanZqdHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDU4NjMsImV4cCI6MjA3MzY4MTg2M30.AL4oiSFsNWx2I3AsH3EKnYAo7uS5REuGWTJCTPn4vQ8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})