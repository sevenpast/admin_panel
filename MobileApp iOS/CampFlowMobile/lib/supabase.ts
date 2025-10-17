import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const supabaseUrl = 'https://qjomzeqfeghqkdjvjtxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb216ZXFmZWdocWtkanZqdHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDU4NjMsImV4cCI6MjA3MzY4MTg2M30.AL4oiSFsNWx2I3AsH3EKnYAo7uS5REuGWTJCTPn4vQ8'

// Create a web-compatible storage adapter
const createWebStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key))
        }
        return Promise.resolve(null)
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
        return Promise.resolve()
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
        return Promise.resolve()
      },
    }
  }
  return AsyncStorage
}

// Create different configurations for web vs native
const supabaseConfig = Platform.OS === 'web' 
  ? {
      // Web configuration - minimal auth setup
      auth: {
        storage: createWebStorage(),
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  : {
      // Native configuration - full auth setup
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)