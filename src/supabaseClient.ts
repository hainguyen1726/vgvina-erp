/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://api-supabase.vgvina.com'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiZXhwIjoxOTk5OTk5OTk5fQ.HPccvqH7vJ8u1F4LlLkK2Uo8cCvXajYciaLK8VwXDtM'

const isHkd = typeof window !== 'undefined' && (window.location.hostname === 'hkd.vgvina.com' || window.location.hostname.includes('hkd'));
const currentSchema = isHkd ? 'hkd' : 'public';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: currentSchema
  }
});

