import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylxsvsuhzlmaxxytevtu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlseHN2c3VoemxtYXh4eXRldnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDg4MDksImV4cCI6MjA3MjkyNDgwOX0.jZtgPvR-MFLgurMk6ukhlqEbE0vNNgZ-2BMMCpn-rOw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)