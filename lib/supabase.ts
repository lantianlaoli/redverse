import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout and better error handling
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });
    },
  },
});

// Database types
export interface Application {
  id: string;
  created_at: string;
  name: string | null;
  url: string | null;
  founder_url: string | null;
  user_id: string | null;
  image: string | null;
  explain: string | null;
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
  views_count: number | null;
  shares_count: number | null;
}

export interface ApplicationWithNotes extends Application {
  note: Note[];
}

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  max_applications: number | null;
  price_monthly: number;
  features: Record<string, unknown> | string[] | null;
  enable: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  created_at: string;
  creem_id: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
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
      console.error('Debug: Supabase storage upload failed', {
        error: error,
        errorMessage: error.message,
        bucketName: 'images',
        fileName: fileName,
        fileSize: file.size,
        fileType: file.type,
        userId: userId
      });
      return { success: false, error: `Storage upload failed: ${error.message}` };
    }

    console.log('Debug: Upload successful, data:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
      
    console.log('Debug: Generated public URL:', publicUrl);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Debug: Unexpected error in uploadImage', {
      error: error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      fileName: file.name,
      fileSize: file.size,
      userId: userId
    });
    return { success: false, error: `Unexpected upload error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Article management functions
export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  
  return data || [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }
  
  return data;
}

export async function createArticle(article: Omit<Article, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string; data?: Article }> {
  const { data, error } = await supabase
    .from('articles')
    .insert([article])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating article:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}

export async function updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'created_at'>>): Promise<{ success: boolean; error?: string; data?: Article }> {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating article:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}

export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}