// ── supabase.js ───────────────────────────────────────────
// Centralized Supabase Client & Storage Configuration for S.P. Coaching Classes
import { createClient } from '@supabase/supabase-js'

const SUPABASE_CONFIG_KEY = 'sp_supabase_config_v1'

// Default fallback / environment values
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Get stored or env config
export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.url && parsed.anonKey) return parsed
    }
  } catch (e) {}

  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY
  }
}

// Save dynamic config from Admin Panel
export function saveSupabaseConfig(urlOrObj, anonKey) {
  try {
    let url = urlOrObj
    let key = anonKey
    if (typeof urlOrObj === 'object' && urlOrObj !== null) {
      url = urlOrObj.url
      key = urlOrObj.anonKey
    }
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url, anonKey: key }))
    initSupabaseClient()
    return true
  } catch (e) {
    console.error('Failed to save Supabase config', e)
    return false
  }
}

let supabaseInstance = null

export function initSupabaseClient() {
  const config = getSupabaseConfig()
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      })
      return supabaseInstance
    } catch (err) {
      console.warn('Supabase initialization warning:', err)
      supabaseInstance = null
    }
  }
  supabaseInstance = null
  return null
}

// Initialize on module load
initSupabaseClient()

export function getSupabase() {
  if (!supabaseInstance) {
    initSupabaseClient()
  }
  return supabaseInstance
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig()
  return Boolean(config.url && config.anonKey)
}

// Test connection
export async function testSupabaseConnection() {
  const client = getSupabase()
  if (!client) return { success: false, message: 'Supabase URL or Anon Key is missing.' }

  try {
    // Attempt a lightweight query
    const { error } = await client.from('sp_blogs').select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still reachable
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        return {
          success: true,
          connected: true,
          tablesNeeded: true,
          message: 'Connected to Supabase! (Tables need to be created with the SQL setup script).'
        }
      }
      return { success: false, message: error.message }
    }
    return { success: true, connected: true, message: 'Successfully connected to Supabase Database & Storage!' }
  } catch (e) {
    return { success: false, message: e.message || 'Connection failed' }
  }
}

export const SUPABASE_SQL_SCHEMA = `-- S.P. Coaching Classes - Supabase SQL Schema Setup
-- Run this in your Supabase Project > SQL Editor

-- 1. Create blogs table
CREATE TABLE IF NOT EXISTS public.sp_blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT,
  primary_keyword TEXT,
  excerpt TEXT,
  content TEXT,
  meta_title TEXT,
  meta_desc TEXT,
  category TEXT DEFAULT 'General',
  reading_time TEXT DEFAULT '5 min read',
  publish_date TEXT,
  image TEXT,
  backlinks JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create gallery table
CREATE TABLE IF NOT EXISTS public.sp_gallery (
  id TEXT PRIMARY KEY,
  src TEXT NOT NULL,
  caption TEXT,
  alt TEXT,
  tag TEXT DEFAULT 'Campus',
  "order" INTEGER DEFAULT 99,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create comments/reviews table
CREATE TABLE IF NOT EXISTS public.sp_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  course TEXT DEFAULT 'S.P. Coaching Student',
  avatar TEXT DEFAULT '🧑‍🎓',
  stars INTEGER DEFAULT 5,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create site settings table
CREATE TABLE IF NOT EXISTS public.sp_settings (
  id TEXT PRIMARY KEY DEFAULT 'general_settings',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security & Public Read/Write for Client App
ALTER TABLE public.sp_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sp_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sp_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Blogs" ON public.sp_blogs FOR SELECT USING (true);
CREATE POLICY "Public Write Blogs" ON public.sp_blogs FOR ALL USING (true);

CREATE POLICY "Public Read Gallery" ON public.sp_gallery FOR SELECT USING (true);
CREATE POLICY "Public Write Gallery" ON public.sp_gallery FOR ALL USING (true);

CREATE POLICY "Public Read Comments" ON public.sp_comments FOR SELECT USING (true);
CREATE POLICY "Public Write Comments" ON public.sp_comments FOR ALL USING (true);

CREATE POLICY "Public Read Settings" ON public.sp_settings FOR SELECT USING (true);
CREATE POLICY "Public Write Settings" ON public.sp_settings FOR ALL USING (true);

-- Storage Bucket: Create a public bucket named 'sp_media' in Supabase Storage!
`
