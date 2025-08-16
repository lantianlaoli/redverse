import { NextRequest, NextResponse } from 'next/server';
import { sendNoteNotification } from '../../../../lib/email';
import { getUserEmail, getUserName } from '../../../../lib/user-adapter';

interface NoteNotificationRequest {
  userId: string;
  projectName: string;
  action: 'created' | 'updated' | 'report';
  noteUrl?: string;
  changes?: {
    likes: { old: number; new: number; diff: number };
    collects: { old: number; new: number; diff: number };
    comments: { old: number; new: number; diff: number };
    views: { old: number; new: number; diff: number };
    shares?: { old: number; new: number; diff: number };
  };
  completeData?: {
    likes_count: number;
    collects_count: number;
    comments_count: number;
    views_count: number;
    shares_count: number;
  };
  dataDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NoteNotificationRequest = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.projectName || !body.action) {
      console.error(`[Email API] Missing required fields: userId=${!!body.userId}, projectName=${!!body.projectName}, action=${!!body.action}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userId, projectName, action' 
        },
        { status: 400 }
      );
    }
    
    // Get user email and name using user adapter
    const userEmail = await getUserEmail(body.userId);
    const founderName = await getUserName(body.userId);

    if (!userEmail) {
      console.error(`[Email API] User email not found - userID: ${body.userId}, project: "${body.projectName}"`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'User email not found for the provided user ID' 
        },
        { status: 404 }
      );
    }

    // Send notification using existing email service
    const result = await sendNoteNotification({
      userEmail: userEmail,
      projectName: body.projectName,
      action: body.action,
      noteUrl: body.noteUrl,
      founderName: founderName || undefined,
      changes: body.changes,
      completeData: body.completeData,
      dataDate: body.dataDate,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error(`[Email API] Email sending failed - project: "${body.projectName}", founder: ${founderName || userEmail}, error: ${result.error}`);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to send notification' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error(`[Email API] Email sending exception:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}