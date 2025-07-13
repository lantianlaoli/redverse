import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Application {
  id: string;
  created_at: string;
  name: string | null;
  url: string | null;
  twitter_id: string | null;
  status: string | null;
  user_id: string | null;
}

export interface Note {
  id: string;
  created_at: string;
  app_id: string | null;
  url: string | null;
  publish_date: string | null;
  likes_count: number | null;
  collects_count: number | null;
  comments_count: number | null;
}

export interface ApplicationWithNotes extends Application {
  note: Note[];
}