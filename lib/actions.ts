'use server';

import { auth } from '@clerk/nextjs/server';
import { supabase, Application, Note, uploadImage } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// Submit application server action
export async function submitApplication(formData: FormData) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in to submit an application'
      };
    }

    const url = formData.get('url') as string;
    const name = formData.get('name') as string;
    const twitterId = formData.get('twitter_id') as string;
    const thumbnailFile = formData.get('thumbnail') as File;
    
    console.log('Debug: Form data received:', {
      url,
      name,
      twitterId,
      thumbnailFile: thumbnailFile ? {
        name: thumbnailFile.name,
        size: thumbnailFile.size,
        type: thumbnailFile.type
      } : null
    });
    
    // Validate required fields
    if (!url || !name || !twitterId || !thumbnailFile || thumbnailFile.size === 0) {
      console.log('Debug: Validation failed', {
        hasUrl: !!url,
        hasName: !!name,
        hasTwitterId: !!twitterId,
        hasThumbnailFile: !!thumbnailFile,
        thumbnailFileSize: thumbnailFile?.size
      });
      return {
        success: false,
        error: 'Website URL, project name, Twitter username, and thumbnail are required'
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return {
        success: false,
        error: 'Invalid URL format'
      };
    }

    // Check if user already submitted this URL
    const { data: existingApp } = await supabase
      .from('application')
      .select('id')
      .eq('user_id', userId)
      .eq('url', url.trim())
      .single();

    if (existingApp) {
      return {
        success: false,
        error: 'You have already submitted this application'
      };
    }

    // Upload thumbnail image
    const uploadResult = await uploadImage(thumbnailFile, userId);
    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload thumbnail'
      };
    }

    // Insert new application
    const { data, error } = await supabase
      .from('application')
      .insert({
        user_id: userId,
        url: url.trim(),
        name: name.trim(),
        twitter_id: twitterId?.trim() || null,
        thumbnail: uploadResult.url
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to save application'
      };
    }

    // Revalidate the pages that show this data
    revalidatePath('/');
    revalidatePath('/dashboard');

    return {
      success: true,
      application: data
    };

  } catch (error) {
    console.error('Submit application error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

// Get user applications server action
export async function getUserApplications(): Promise<{
  success: boolean;
  applications?: Application[];
  error?: string;
}> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in to view your applications'
      };
    }

    const { data: applications, error } = await supabase
      .from('application')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to fetch applications'
      };
    }

    return {
      success: true,
      applications
    };

  } catch (error) {
    console.error('Fetch applications error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

// Get leaderboard server action
export async function getLeaderboard(): Promise<{
  success: boolean;
  leaderboard?: Array<Application & { note?: Note; total_engagement: number }>;
  error?: string;
}> {
  try {
    // Step 1: Query all applications
    const { data: applications, error: appError } = await supabase
      .from('application')
      .select('*')
      .order('created_at', { ascending: false });

    if (appError) {
      console.error('Database error:', appError);
      return {
        success: false,
        error: 'Failed to fetch applications'
      };
    }

    if (!applications || applications.length === 0) {
      return {
        success: true,
        leaderboard: []
      };
    }

    // Step 2: Query notes for these applications
    const appIds = applications.map(app => app.id);
    const { data: notes, error: noteError } = await supabase
      .from('note')
      .select('*')
      .in('app_id', appIds);

    if (noteError) {
      console.error('Database error:', noteError);
      return {
        success: false,
        error: 'Failed to fetch notes data'
      };
    }

    // Step 3: Manually join data and calculate engagement
    const leaderboard = applications
      .map((app: Application) => {
        // Find the most recent note for this app
        const appNotes = notes?.filter(note => note.app_id === app.id) || [];
        const mostRecentNote = appNotes.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        // Weighted engagement calculation: collects (3x), comments (2x), likes (1x)
        const totalEngagement = mostRecentNote ? 
          (mostRecentNote.likes_count || 0) * 1 + 
          (mostRecentNote.collects_count || 0) * 3 + 
          (mostRecentNote.comments_count || 0) * 2 : 0;
        
        return {
          ...app,
          note: mostRecentNote,
          total_engagement: totalEngagement,
        };
      })
      .filter(app => app.note) // Only include apps that have notes
      .sort((a, b) => b.total_engagement - a.total_engagement)
      .slice(0, 10); // Top 10

    return {
      success: true,
      leaderboard
    };

  } catch (error) {
    console.error('Fetch leaderboard error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

// Admin Actions
export async function getAllApplications(): Promise<{
  success: boolean;
  applications?: Application[];
  error?: string;
}> {
  try {
    const { data: applications, error } = await supabase
      .from('application')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to fetch applications'
      };
    }

    return {
      success: true,
      applications
    };

  } catch (error) {
    console.error('Fetch all applications error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}


export async function createNote(appId: string, formData: FormData): Promise<{
  success: boolean;
  note?: Note;
  error?: string;
}> {
  try {
    const url = formData.get('url') as string;
    const publishDate = formData.get('publish_date') as string;
    const likesCount = parseInt(formData.get('likes_count') as string) || 0;
    const collectsCount = parseInt(formData.get('collects_count') as string) || 0;
    const commentsCount = parseInt(formData.get('comments_count') as string) || 0;

    if (!url) {
      return {
        success: false,
        error: 'URL is required'
      };
    }

    const { data: note, error } = await supabase
      .from('note')
      .insert({
        app_id: appId,
        url: url.trim(),
        publish_date: publishDate || null,
        likes_count: likesCount,
        collects_count: collectsCount,
        comments_count: commentsCount,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to create note'
      };
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      note
    };

  } catch (error) {
    console.error('Create note error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

export async function updateNote(noteId: string, formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const url = formData.get('url') as string;
    const publishDate = formData.get('publish_date') as string;
    const likesCount = parseInt(formData.get('likes_count') as string) || 0;
    const collectsCount = parseInt(formData.get('collects_count') as string) || 0;
    const commentsCount = parseInt(formData.get('comments_count') as string) || 0;

    if (!url) {
      return {
        success: false,
        error: 'URL is required'
      };
    }

    const { error } = await supabase
      .from('note')
      .update({
        url: url.trim(),
        publish_date: publishDate || null,
        likes_count: likesCount,
        collects_count: collectsCount,
        comments_count: commentsCount,
      })
      .eq('id', noteId);

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to update note'
      };
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };

  } catch (error) {
    console.error('Update note error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

export async function deleteNote(noteId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('note')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to delete note'
      };
    }

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };

  } catch (error) {
    console.error('Delete note error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

export async function getNotesForApp(appId: string): Promise<{
  success: boolean;
  notes?: Note[];
  error?: string;
}> {
  try {
    const { data: notes, error } = await supabase
      .from('note')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to fetch notes'
      };
    }

    return {
      success: true,
      notes
    };

  } catch (error) {
    console.error('Fetch notes error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

export async function deleteApplication(appId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // First delete all notes associated with this application
    const { error: notesError } = await supabase
      .from('note')
      .delete()
      .eq('app_id', appId);

    if (notesError) {
      console.error('Failed to delete associated notes:', notesError);
      return {
        success: false,
        error: 'Failed to delete associated notes'
      };
    }

    // Then delete the application
    const { error: appError } = await supabase
      .from('application')
      .delete()
      .eq('id', appId);

    if (appError) {
      console.error('Database error:', appError);
      return {
        success: false,
        error: 'Failed to delete application'
      };
    }

    // Revalidate relevant pages
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error('Delete application error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

// New Admin Dashboard Functions


export async function getApplicationsByTwitter(): Promise<{
  success: boolean;
  twitterGroups?: Array<{
    twitterId: string;
    applications: Application[];
    totalCount: number;
  }>;
  error?: string;
}> {
  try {
    const { data: applications, error } = await supabase
      .from('application')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to fetch applications'
      };
    }

    if (!applications || applications.length === 0) {
      return {
        success: true,
        twitterGroups: []
      };
    }

    // Group by twitter_id
    const groupedByTwitter = applications.reduce((groups, app) => {
      const twitterId = app.twitter_id || 'unknown';
      if (!groups[twitterId]) {
        groups[twitterId] = [];
      }
      groups[twitterId].push(app);
      return groups;
    }, {} as { [key: string]: Application[] });

    // Transform to required format
    const twitterGroups = Object.entries(groupedByTwitter).map(([twitterId, apps]) => {
      return {
        twitterId,
        applications: apps as Application[],
        totalCount: (apps as Application[]).length,
      };
    }).sort((a, b) => b.totalCount - a.totalCount); // Sort by application count

    return {
      success: true,
      twitterGroups
    };

  } catch (error) {
    console.error('Get applications by Twitter error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

