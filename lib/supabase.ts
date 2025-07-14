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
  user_id: string | null;
  thumbnail: string | null;
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

// Image upload utility functions
export async function uploadImage(file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log('Debug: Starting image upload', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId
    });
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.log('Debug: File too large');
      return { success: false, error: 'File size must be less than 2MB' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Debug: Invalid file type');
      return { success: false, error: 'File must be an image' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${fileExtension}`;
    
    console.log('Debug: Generated filename:', fileName);

    // Upload to Supabase Storage
    console.log('Debug: Starting Supabase upload...');
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.log('Debug: Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    console.log('Debug: Upload successful, data:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
      
    console.log('Debug: Generated public URL:', publicUrl);

    return { success: true, url: publicUrl };
  } catch {
    return { success: false, error: 'Failed to upload image' };
  }
}