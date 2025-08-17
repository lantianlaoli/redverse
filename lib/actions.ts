'use server';

import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { supabase, Application, Note, uploadImage } from '@/lib/supabase';
import { checkApplicationLimit } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';
import { sendNewApplicationNotification, sendBugReportEmail, sendNoteNotification, sendFeedbackEmail } from './email';
import { getUserInfo, getUserEmail } from './user-adapter';

// Network diagnostic function
async function diagnoseNetworkConnectivity(): Promise<{
  supabaseReachable: boolean;
  dnsResolution: boolean;
  error?: string;
}> {
  try {
    // Test basic fetch to Supabase with proper timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout
    
    const response = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return {
      supabaseReachable: response.status === 401, // 401 is expected without proper auth
      dnsResolution: true
    };
  } catch (error) {
    console.error('Network diagnostic failed:', error);
    return {
      supabaseReachable: false,
      dnsResolution: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper function to send bug report email
async function sendBugReport(error: string, userId: string | null, formData: FormData) {
  try {
    // Get user email safely with migration compatibility
    let userEmail = 'Unknown';
    if (userId) {
      try {
        const email = await getUserEmail(userId);
        userEmail = email || 'Unknown';
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

    // Check for Vercel domains
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname.includes('vercel.app') || 
          hostname.includes('vercel.dev') || 
          hostname.includes('vercel.com') ||
          hostname.endsWith('.vercel.app') ||
          hostname.endsWith('.vercel.dev')) {
        return {
          success: false,
          error: 'Vercel domains are not allowed. Please use your custom domain.'
        };
      }
    } catch {
      return {
        success: false,
        error: 'Invalid URL format'
      };
    }

    // Check for app store domains
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname.includes('play.google.com') || 
          hostname.includes('apps.apple.com')) {
        return {
          success: false,
          error: 'App store links are not allowed. Please use your product\'s landing page.'
        };
      }
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
      tableName: 'applications'
    });
    
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
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
      // image, explain, founder_url will be added by admin backend
    };
    
    console.log('Debug: Attempting to insert application', {
      tableName: 'applications',
      data: applicationData,
      userId: userId
    });
    
    let data, error;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Debug: Database insert attempt ${retryCount + 1}/${maxRetries}`);
        
        const result = await supabase
          .from('applications')
          .insert(applicationData)
          .select()
          .single();
        data = result.data;
        error = result.error;
        break; // Success, exit retry loop
      } catch (networkError) {
        retryCount++;
        console.error(`Debug: Network error on attempt ${retryCount}/${maxRetries}`, {
          error: networkError,
          errorMessage: networkError instanceof Error ? networkError.message : 'Unknown network error',
          retryCount,
          maxRetries
        });
        
        if (retryCount >= maxRetries) {
          // Run network diagnostics
          console.log('Debug: Running network diagnostics after all retries failed');
          const diagnostics = await diagnoseNetworkConnectivity();
          
          console.error('Debug: All retry attempts failed for database insert', {
            error: networkError,
            errorMessage: networkError instanceof Error ? networkError.message : 'Unknown network error',
            errorStack: networkError instanceof Error ? networkError.stack : undefined,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            attemptedData: applicationData,
            userId: userId,
            totalRetries: maxRetries,
            networkDiagnostics: diagnostics
          });
          
          // Send bug report with diagnostics
          await sendBugReport(
            `Network error after ${maxRetries} retry attempts during database insert: ${networkError instanceof Error ? networkError.message : 'Unknown network error'}. Network Diagnostics: Supabase reachable: ${diagnostics.supabaseReachable}, DNS resolution: ${diagnostics.dnsResolution}, Diagnostic error: ${diagnostics.error || 'None'}`,
            userId,
            formData
          );
          
          return {
            success: false,
            error: 'Network connection failed after multiple attempts. Please check your internet connection and try again.'
          };
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, retryCount - 1) * 1000; // 1s, 2s, 4s
        console.log(`Debug: Waiting ${waitTime}ms before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    if (error) {
      console.error('Debug: Application database insert failed', {
        error: error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        tableName: 'applications',
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

    console.log('Debug: Application submitted successfully, email will be sent after feedback collection', {
      applicationId: data?.id,
      userId: userId ? `${userId.substring(0, 8)}...` : null
    });

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
  applications?: Array<Application & { notes?: Note; total_engagement: number }>;
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
      .from('applications')
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
      .from('notes')
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

      // CES (Community Engagement Score) calculation based on Xiaohongshu algorithm: likes (1x), saves (1x), comments (4x), shares (4x)
      const totalEngagement = mostRecentNote ? 
        (mostRecentNote.likes_count || 0) * 1 + 
        (mostRecentNote.collects_count || 0) * 1 + 
        (mostRecentNote.comments_count || 0) * 4 + 
        (mostRecentNote.shares_count || 0) * 4 : 0;
      
      return {
        ...app,
        notes: mostRecentNote,
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
  leaderboard?: Array<Application & { notes?: Note; total_engagement: number }>;
  error?: string;
}> {
  try {
    // Step 1: Query all applications
    const { data: applications, error: appError } = await supabase
      .from('applications')
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
      .from('notes')
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

        // CES (Community Engagement Score) calculation based on Xiaohongshu algorithm: likes (1x), saves (1x), comments (4x), shares (4x)
        const totalEngagement = mostRecentNote ? 
          (mostRecentNote.likes_count || 0) * 1 + 
          (mostRecentNote.collects_count || 0) * 1 + 
          (mostRecentNote.comments_count || 0) * 4 + 
          (mostRecentNote.shares_count || 0) * 4 : 0;
        
        return {
          ...app,
          notes: mostRecentNote,
          total_engagement: totalEngagement,
        };
      })
      .filter(app => app.notes) // Only include apps that have notes
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
      .from('applications')
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
    const viewsCount = parseInt(formData.get('views_count') as string) || 0;
    const sharesCount = parseInt(formData.get('shares_count') as string) || 0;

    console.log('Debug: Extracted form data:', {
      url,
      likesCount,
      collectsCount,
      commentsCount,
      viewsCount,
      sharesCount
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
      views_count: viewsCount,
      shares_count: sharesCount,
    };

    console.log('Debug: Attempting to insert note:', insertData);

    const { data: note, error } = await supabase
      .from('notes')
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

    // Get application and user information for notification
    try {
      const { data: app } = await supabase
        .from('applications')
        .select('name, user_id')
        .eq('id', appId)
        .single();

      if (app && app.user_id) {
        // Get user email with migration compatibility
        try {
          const userInfo = await getUserInfo(app.user_id);
          
          if (userInfo?.email) {
            await sendNoteNotification({
              userEmail: userInfo.email,
              projectName: app.name || 'Your Project',
              action: 'created',
              noteUrl: note.url || undefined,
              founderName: userInfo.fullName
            });
          }
        } catch (userError) {
          console.error('Failed to send note creation notification:', userError);
        }
      }
    } catch (notificationError) {
      console.error('Failed to process note creation notification:', notificationError);
    }

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
    const viewsCount = parseInt(formData.get('views_count') as string) || 0;
    const sharesCount = parseInt(formData.get('shares_count') as string) || 0;

    console.log('Debug: Extracted form data:', {
      url,
      likesCount,
      collectsCount,
      commentsCount,
      viewsCount,
      sharesCount
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
      views_count: viewsCount,
      shares_count: sharesCount,
    };

    console.log('Debug: Attempting to update note:', updateData);

    // Get current note data before update for comparison
    const { data: oldNote } = await supabase
      .from('notes')
      .select('likes_count, collects_count, comments_count, views_count, shares_count, app_id')
      .eq('id', noteId)
      .single();

    const { error } = await supabase
      .from('notes')
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

    // Send notification with data changes
    if (oldNote) {
      try {
        const { data: app } = await supabase
          .from('applications')
          .select('name, user_id')
          .eq('id', oldNote.app_id)
          .single();

        if (app && app.user_id) {
          // Get user email with migration compatibility
          try {
            const userInfo = await getUserInfo(app.user_id);

            if (userInfo?.email) {
              const changes = {
                likes: {
                  old: oldNote.likes_count || 0,
                  new: likesCount,
                  diff: likesCount - (oldNote.likes_count || 0)
                },
                collects: {
                  old: oldNote.collects_count || 0,
                  new: collectsCount,
                  diff: collectsCount - (oldNote.collects_count || 0)
                },
                comments: {
                  old: oldNote.comments_count || 0,
                  new: commentsCount,
                  diff: commentsCount - (oldNote.comments_count || 0)
                },
                views: {
                  old: oldNote.views_count || 0,
                  new: viewsCount,
                  diff: viewsCount - (oldNote.views_count || 0)
                },
                shares: {
                  old: oldNote.shares_count || 0,
                  new: sharesCount,
                  diff: sharesCount - (oldNote.shares_count || 0)
                }
              };

              // Only send notification if there are actual changes
              const hasChanges = changes.likes.diff !== 0 || changes.collects.diff !== 0 || changes.comments.diff !== 0 || changes.views.diff !== 0 || changes.shares.diff !== 0;
              
              if (hasChanges) {
                await sendNoteNotification({
                  userEmail: userInfo.email,
                  projectName: app.name || 'Your Project',
                  action: 'updated',
                  noteUrl: url || undefined,
                  founderName: userInfo.fullName,
                  changes
                });
              }
            }
          } catch (userError) {
            console.error('Failed to send note update notification:', userError);
          }
        }
      } catch (notificationError) {
        console.error('Failed to process note update notification:', notificationError);
      }
    }

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
      .from('notes')
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
      .from('notes')
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
      .from('notes')
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
      .from('applications')
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


export async function getApplicationsByFounder(): Promise<{
  success: boolean;
  founderGroups?: Array<{
    founderUrl: string;
    applications: Application[];
    totalCount: number;
  }>;
  error?: string;
}> {
  try {
    const { data: applications, error } = await supabase
      .from('applications')
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
        founderGroups: []
      };
    }

    // Group by founder_url
    const groupedByFounder = applications.reduce((groups, app) => {
      const founderUrl = app.founder_url || 'unknown';
      if (!groups[founderUrl]) {
        groups[founderUrl] = [];
      }
      groups[founderUrl].push(app);
      return groups;
    }, {} as { [key: string]: Application[] });

    // Transform to required format
    const founderGroups = Object.entries(groupedByFounder).map(([founderUrl, apps]) => {
      return {
        founderUrl,
        applications: apps as Application[],
        totalCount: (apps as Application[]).length,
      };
    }).sort((a, b) => b.totalCount - a.totalCount); // Sort by application count

    return {
      success: true,
      founderGroups
    };

  } catch (error) {
    console.error('Get applications by Founder error:', error);
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
    const founderUrl = formData.get('founder_url') as string;
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
      founder_url: founderUrl.trim() || null,
      explain: explain.trim() || null,
      image: imageUrl || null
    };

    // Update application in database
    const { error } = await supabase
      .from('applications')
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

// Track recent feedback submissions to prevent duplicates (in-memory store for session)
const recentFeedbackSubmissions = new Map<string, number>();

// Submit feedback server action
export async function submitFeedback(feedbackText: string, applicationData?: {
  id: string;
  name: string;
  url: string;
} | null): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in to submit feedback'
      };
    }

    // Create a unique key for this feedback submission to prevent duplicates
    const shortKey = `${userId}_${applicationData?.id || 'unknown'}`;
    
    // Check if we've submitted feedback for this application recently (within 30 seconds)
    const recentSubmission = recentFeedbackSubmissions.get(shortKey);
    const now = Date.now();
    
    if (recentSubmission && (now - recentSubmission) < 30000) {
      console.log('Debug: Duplicate feedback submission prevented', {
        userId,
        applicationId: applicationData?.id,
        timeSinceLastSubmission: now - recentSubmission
      });
      return {
        success: true // Return success to avoid error messages, but don't send duplicate email
      };
    }
    
    // Record this submission
    recentFeedbackSubmissions.set(shortKey, now);
    
    // Clean up old entries (older than 1 minute)
    for (const [key, timestamp] of recentFeedbackSubmissions.entries()) {
      if (now - timestamp > 60000) {
        recentFeedbackSubmissions.delete(key);
      }
    }

    // Allow empty feedback for cases where user skips feedback
    console.log('Debug: Processing feedback submission', {
      feedbackLength: feedbackText.trim().length,
      hasApplicationData: !!applicationData,
      submissionKey: shortKey
    });

    // Get user information with migration compatibility
    console.log('Debug: Getting user information for feedback submission', { userId });
    
    let userEmail = 'Unknown';
    let userName = 'Unknown User';
    
    try {
      const userInfo = await getUserInfo(userId);
      console.log('Debug: User info retrieved', { 
        userId: userInfo?.id,
        hasEmail: !!userInfo?.email,
        hasFullName: !!userInfo?.fullName
      });
      
      if (userInfo?.email) {
        userEmail = userInfo.email;
        userName = userInfo.fullName || userInfo.email;
      } else {
        console.log('Debug: No user info found, using fallback values');
        userEmail = 'user-not-found@unknown.com';
        userName = `User ${userId.substring(0, 8)}`;
      }
      
      console.log('Debug: User info extracted', { userEmail: userEmail !== 'Unknown' ? 'extracted' : 'fallback', userName });
    } catch (userError) {
      console.error('Debug: Failed to get user info', {
        error: userError,
        errorMessage: userError instanceof Error ? userError.message : 'Unknown error',
        userId
      });
      
      // Continue with fallback values
      userEmail = 'user-error@unknown.com';
      userName = `User ${userId.substring(0, 8)}`;
    }

    // Send application notification with feedback
    console.log('Debug: Preparing to send application notification with feedback', {
      hasUserEmail: userEmail !== 'Unknown',
      hasUserName: userName !== 'Unknown User',
      hasApplicationData: !!applicationData,
      feedbackLength: feedbackText.trim().length
    });
    
    const emailResult = await sendNewApplicationNotification({
      projectName: applicationData?.name || 'Unknown Project',
      websiteUrl: applicationData?.url || 'Unknown URL',
      submitterEmail: userEmail,
      submittedAt: new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle: 'full',
        timeStyle: 'short'
      }),
      adminDashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`,
      userFeedback: feedbackText.trim() || "No feedback provided"
    });

    if (!emailResult.success) {
      console.error('Debug: Failed to send feedback email', {
        error: emailResult.error,
        userEmail,
        userName,
        feedbackLength: feedbackText.trim().length
      });
      return {
        success: false,
        error: 'Failed to send feedback. Please try again.'
      };
    }

    console.log('Debug: Feedback email sent successfully', {
      userEmail: userEmail !== 'Unknown' ? 'sent' : 'fallback',
      userName,
      feedbackLength: feedbackText.trim().length
    });

    return { success: true };

  } catch (error) {
    console.error('Submit feedback error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    };
  }
}

// Test email function for admin debugging
export async function sendTestEmail(emailType: 'application' | 'bug' | 'note_created' | 'note_updated' | 'note_report' | 'feedback'): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId } = await auth();
    
    // Only allow admin to use this function
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    
    if (userEmail !== process.env.ADMIN_EMAIL && userEmail !== 'lantianlaoli@gmail.com') {
      return { success: false, error: 'Admin access required' };
    }

    const currentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

    switch (emailType) {
      case 'application':
        await sendNewApplicationNotification({
          projectName: 'TestApp Pro',
          websiteUrl: 'https://testapp.example.com',
          twitterUsername: 'testfounder',
          submitterEmail: 'founder@testapp.com',
          submittedAt: currentDate,
          thumbnailUrl: 'https://via.placeholder.com/100x100?text=TestApp',
          adminDashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
          userFeedback: 'This is a test application submission for debugging email templates. The app focuses on productivity and has been growing steadily in the past few months.'
        });
        break;

      case 'bug':
        await sendBugReportEmail({
          error: 'Test Error: Database connection timeout occurred during application submission process. This is a simulated error for testing email templates.',
          userEmail: 'testuser@example.com',
          timestamp: currentDate,
          submissionData: {
            projectName: 'Failed Test App',
            websiteUrl: 'https://failedtestapp.com',
            twitterUsername: 'failedfounder'
          },
          userAgent: 'Mozilla/5.0 (Test Browser) Test/1.0'
        });
        break;

      case 'note_created':
        await sendNoteNotification({
          userEmail: process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com',
          projectName: 'OneTab',
          action: 'created',
          noteUrl: 'https://xiaohongshu.com/test-note-url',
          founderName: 'Alex Johnson'
        });
        break;

      case 'note_updated':
        // Simulate realistic test data matching actual update scenario
        // Include some metrics with no changes to test edge cases
        const testOldNote = {
          likes_count: 224,
          collects_count: 45,
          comments_count: 12,
          views_count: 1850,
          shares_count: 8
        };
        const testNewData = {
          likesCount: 245,        // +21 increase
          collectsCount: 45,      // No change (diff = 0)
          commentsCount: 16,      // +4 increase  
          viewsCount: 2150,       // +300 increase
          sharesCount: 8          // No change (diff = 0)
        };
        
        // Use exact same logic as updateNote function
        const testChanges = {
          likes: {
            old: testOldNote.likes_count || 0,
            new: testNewData.likesCount,
            diff: testNewData.likesCount - (testOldNote.likes_count || 0)
          },
          collects: {
            old: testOldNote.collects_count || 0,
            new: testNewData.collectsCount,
            diff: testNewData.collectsCount - (testOldNote.collects_count || 0)
          },
          comments: {
            old: testOldNote.comments_count || 0,
            new: testNewData.commentsCount,
            diff: testNewData.commentsCount - (testOldNote.comments_count || 0)
          },
          views: {
            old: testOldNote.views_count || 0,
            new: testNewData.viewsCount,
            diff: testNewData.viewsCount - (testOldNote.views_count || 0)
          },
          shares: {
            old: testOldNote.shares_count || 0,
            new: testNewData.sharesCount,
            diff: testNewData.sharesCount - (testOldNote.shares_count || 0)
          }
        };

        await sendNoteNotification({
          userEmail: process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com',
          projectName: 'OneTab',
          action: 'updated',
          noteUrl: 'https://xiaohongshu.com/test-note-url',
          founderName: 'Alex Johnson',
          changes: testChanges,
          completeData: {
            likes_count: testNewData.likesCount,
            collects_count: testNewData.collectsCount,
            comments_count: testNewData.commentsCount,
            views_count: testNewData.viewsCount,
            shares_count: testNewData.sharesCount,
          },
          dataDate: new Date().toISOString()
        });
        break;

      case 'note_report':
        // Test complete data report (no changes, just current data)
        await sendNoteNotification({
          userEmail: process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com',
          projectName: 'OneTab',
          action: 'report',
          noteUrl: 'https://xiaohongshu.com/test-note-url',
          founderName: 'Alex Johnson',
          completeData: {
            likes_count: 245,
            collects_count: 45,
            comments_count: 16,
            views_count: 2150,
            shares_count: 8,
          },
          dataDate: new Date().toISOString()
        });
        break;

      case 'feedback':
        await sendFeedbackEmail({
          feedbackText: 'This is a test feedback submission for debugging email templates. The user is requesting a new feature for better analytics dashboard and mentioned some UI improvements that could enhance the user experience.',
          userEmail: 'testuser@example.com',
          userName: 'Test User',
          submittedAt: currentDate,
          applicationData: {
            name: 'Test Feedback App',
            url: 'https://testfeedbackapp.com',
            id: 'test-app-123'
          }
        });
        break;

      default:
        return { success: false, error: 'Unknown email type' };
    }

    return { success: true };

  } catch (error) {
    console.error('Send test email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test email'
    };
  }
}

