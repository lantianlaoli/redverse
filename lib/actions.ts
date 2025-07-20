'use server';

import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { supabase, Application, Note, uploadImage } from '@/lib/supabase';
import { checkApplicationLimit } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';
import { sendNewApplicationNotification, sendBugReportEmail } from './email';

// Helper function to send bug report email
async function sendBugReport(error: string, userId: string | null, formData: FormData) {
  try {
    // Get user email safely
    let userEmail = 'Unknown';
    if (userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        userEmail = user.emailAddresses?.[0]?.emailAddress || 'Unknown';
      } catch (e) {
        console.error('Failed to get user email for bug report:', e);
      }
    }

    const submissionData = {
      websiteUrl: formData.get('url') as string,
    };

    await sendBugReportEmail({
      error,
      userEmail,
      timestamp: new Date().toISOString(),
      submissionData,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'
    });
  } catch (emailError) {
    console.error('Failed to send bug report email:', emailError);
  }
}

// Submit application server action
export async function submitApplication(formData: FormData) {
  try {
    console.log('Debug: Starting submitApplication');
    
    const { userId } = await auth();
    
    console.log('Debug: Authentication check', {
      userId: userId ? `${userId.substring(0, 8)}...` : null,
      authenticated: !!userId
    });
    
    if (!userId) {
      console.log('Debug: User not authenticated');
      return {
        success: false,
        error: 'Please sign in to submit an application'
      };
    }

    const url = formData.get('url') as string;
    
    console.log('Debug: Form data received:', {
      url
    });
    
    // Validate required fields - only URL is required
    if (!url) {
      console.log('Debug: Validation failed - URL is required');
      return {
        success: false,
        error: 'Website URL is required'
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

    // Check subscription limits
    console.log('Debug: Checking subscription limits for user', { userId });
    
    const limitCheck = await checkApplicationLimit(userId);
    if (!limitCheck.success) {
      console.error('Debug: Failed to check application limit', { 
        error: limitCheck.error,
        userId 
      });
      return {
        success: false,
        error: limitCheck.error || 'Failed to verify subscription'
      };
    }

    if (!limitCheck.canSubmit) {
      console.log('Debug: User reached application limit', {
        userId,
        remainingCount: limitCheck.remainingCount,
        planName: limitCheck.subscription?.plan_name
      });
      return {
        success: false,
        error: 'You have reached your application submission limit. Please upgrade to Pro for unlimited submissions.'
      };
    }

    console.log('Debug: Subscription check passed', {
      userId,
      remainingCount: limitCheck.remainingCount,
      planName: limitCheck.subscription?.plan_name
    });

    // Check if user already submitted this URL
    console.log('Debug: Checking for existing application', {
      userId: userId,
      url: url.trim(),
      tableName: 'application'
    });
    
    const { data: existingApp, error: checkError } = await supabase
      .from('application')
      .select('id')
      .eq('user_id', userId)
      .eq('url', url.trim())
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found, which is expected
      console.error('Debug: Error checking existing application', {
        error: checkError,
        errorCode: checkError.code,
        errorMessage: checkError.message,
        userId: userId,
        url: url.trim()
      });
    } else {
      console.log('Debug: Existing application check completed', {
        found: !!existingApp,
        existingAppId: existingApp?.id,
        userId: userId
      });
    }

    if (existingApp) {
      return {
        success: false,
        error: 'You have already submitted this application'
      };
    }

    console.log('Debug: Skipping image upload - handled by admin backend');

    // Extract project name from URL if not provided
    const extractProjectName = (url: string): string => {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace(/^www\./, '');
        const domain = hostname.split('.')[0];
        return domain;
      } catch {
        return 'Unknown Project';
      }
    };

    // Insert new application
    const applicationData = {
      user_id: userId,
      url: url.trim(),
      name: extractProjectName(url)
      // image, explain, twitter_id will be added by admin backend
    };
    
    console.log('Debug: Attempting to insert application', {
      tableName: 'application',
      data: applicationData,
      userId: userId
    });
    
    const { data, error } = await supabase
      .from('application')
      .insert(applicationData)
      .select()
      .single();

    if (error) {
      console.error('Debug: Application database insert failed', {
        error: error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        tableName: 'application',
        attemptedData: applicationData,
        userId: userId
      });
      
      // Send bug report email for database error
      await sendBugReport(
        `Database insert failed: ${error.message || error.code || 'Unknown database error'}. Details: ${error.details || 'No details'}`,
        userId,
        formData
      );
      
      return {
        success: false,
        error: `Failed to save application: ${error.message || error.code || 'Unknown database error'}`
      };
    }
    
    console.log('Debug: Application inserted successfully', {
      applicationId: data?.id,
      userId: userId,
      insertedData: data
    });

    // Revalidate the pages that show this data
    revalidatePath('/');
    revalidatePath('/dashboard');

    // Send email notification (don't let email failure affect submission success)
    try {
      console.log('Debug: Starting email notification process', {
        userId: userId ? `${userId.substring(0, 8)}...` : null,
        applicationId: data?.id
      });
      
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userEmail = user.emailAddresses?.[0]?.emailAddress || 'Unknown';
      
      console.log('Debug: User email retrieved', {
        userEmail: userEmail !== 'Unknown' ? `${userEmail.split('@')[0]}@***` : 'Unknown',
        hasEmail: userEmail !== 'Unknown'
      });
      
      const emailResult = await sendNewApplicationNotification({
        projectName: applicationData.name,
        websiteUrl: applicationData.url,
        submitterEmail: userEmail,
        submittedAt: new Date().toLocaleString('en-US', {
          timeZone: 'UTC',
          dateStyle: 'full',
          timeStyle: 'short'
        }),
        adminDashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`
      });
      
      if (emailResult.success) {
        console.log('Debug: Email notification sent successfully');
      } else {
        console.error('Debug: Email notification failed', {
          error: emailResult.error,
          applicationId: data?.id
        });
      }
    } catch (emailError) {
      console.error('Debug: Email notification process failed', {
        error: emailError,
        errorMessage: emailError instanceof Error ? emailError.message : 'Unknown error',
        applicationId: data?.id,
        userId: userId ? `${userId.substring(0, 8)}...` : null
      });
    }

    return {
      success: true,
      application: data
    };

  } catch (error) {
    console.error('Submit application error:', error);
    
    // Send bug report email for unexpected errors
    await sendBugReport(
      `Unexpected error in submitApplication: ${error instanceof Error ? error.message : 'Unknown error'}`,
      null,
      formData
    );
    
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

// Get user applications server action
export async function getUserApplications(): Promise<{
  success: boolean;
  applications?: Array<Application & { note?: Note; total_engagement: number }>;
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

    // Step 1: Get user's applications
    const { data: applications, error: appError } = await supabase
      .from('application')
      .select('*')
      .eq('user_id', userId)
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
        applications: []
      };
    }

    // Step 2: Get all notes for these applications
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

    // Step 3: Join data and calculate engagement
    const applicationsWithNotes = applications.map((app: Application) => {
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
    .sort((a, b) => b.total_engagement - a.total_engagement);

    return {
      success: true,
      applications: applicationsWithNotes
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
    console.log('Debug: Creating note for appId:', appId);
    console.log('Debug: FormData keys:', Array.from(formData.keys()));
    
    const url = formData.get('url') as string;
    const likesCount = parseInt(formData.get('likes_count') as string) || 0;
    const collectsCount = parseInt(formData.get('collects_count') as string) || 0;
    const commentsCount = parseInt(formData.get('comments_count') as string) || 0;

    console.log('Debug: Extracted form data:', {
      url,
      likesCount,
      collectsCount,
      commentsCount
    });

    if (!url) {
      console.log('Debug: URL validation failed');
      return {
        success: false,
        error: 'URL is required'
      };
    }

    const insertData = {
      app_id: appId,
      url: url.trim(),
      likes_count: likesCount,
      collects_count: collectsCount,
      comments_count: commentsCount,
    };

    console.log('Debug: Attempting to insert note:', insertData);

    const { data: note, error } = await supabase
      .from('note')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Debug: Database error creating note:', {
        error: error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        insertData
      });
      return {
        success: false,
        error: `Failed to create note: ${error.message}`
      };
    }

    console.log('Debug: Note created successfully:', note);

    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      note
    };

  } catch (error) {
    console.error('Debug: Create note error:', error);
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
    console.log('Debug: Updating note with ID:', noteId);
    console.log('Debug: FormData keys:', Array.from(formData.keys()));
    
    const url = formData.get('url') as string;
    const likesCount = parseInt(formData.get('likes_count') as string) || 0;
    const collectsCount = parseInt(formData.get('collects_count') as string) || 0;
    const commentsCount = parseInt(formData.get('comments_count') as string) || 0;

    console.log('Debug: Extracted form data:', {
      url,
      likesCount,
      collectsCount,
      commentsCount
    });

    if (!url) {
      console.log('Debug: URL validation failed');
      return {
        success: false,
        error: 'URL is required'
      };
    }

    const updateData = {
      url: url.trim(),
      likes_count: likesCount,
      collects_count: collectsCount,
      comments_count: commentsCount,
    };

    console.log('Debug: Attempting to update note:', updateData);

    const { error } = await supabase
      .from('note')
      .update(updateData)
      .eq('id', noteId);

    if (error) {
      console.error('Debug: Database error updating note:', {
        error: error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        noteId,
        updateData
      });
      return {
        success: false,
        error: `Failed to update note: ${error.message}`
      };
    }

    console.log('Debug: Note updated successfully');

    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };

  } catch (error) {
    console.error('Debug: Update note error:', error);
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

// Update application server action
export async function updateApplication(appId: string, formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in to update applications'
      };
    }

    const name = formData.get('name') as string;
    const twitterId = formData.get('twitter_id') as string;
    const explain = formData.get('explain') as string;
    const imageFile = formData.get('image') as File | null;
    const currentImage = formData.get('current_image') as string;

    if (!name?.trim()) {
      return {
        success: false,
        error: 'Application name is required'
      };
    }

    // Handle image upload if a new image is provided
    let imageUrl = currentImage;
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImage(imageFile, userId);
      if (!uploadResult.success) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload image'
        };
      }
      imageUrl = uploadResult.url || '';
    }

    // Prepare update data
    const updateData: Partial<Application> = {
      name: name.trim(),
      twitter_id: twitterId.trim() || null,
      explain: explain.trim() || null,
      image: imageUrl || null
    };

    // Update application in database
    const { error } = await supabase
      .from('application')
      .update(updateData)
      .eq('id', appId);

    if (error) {
      console.error('Database error:', error);
      return {
        success: false,
        error: 'Failed to update application'
      };
    }

    // Revalidate relevant pages
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error('Update application error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

