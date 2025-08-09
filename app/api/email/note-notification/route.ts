import { NextRequest, NextResponse } from 'next/server';
import { sendNoteNotification } from '../../../../lib/email';

interface NoteNotificationRequest {
  userEmail: string;
  projectName: string;
  action: 'created' | 'updated' | 'report';
  noteUrl?: string;
  founderName?: string;
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
    if (!body.userEmail || !body.projectName || !body.action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userEmail, projectName, action' 
        },
        { status: 400 }
      );
    }

    // Send notification using existing email service
    const result = await sendNoteNotification({
      userEmail: body.userEmail,
      projectName: body.projectName,
      action: body.action,
      noteUrl: body.noteUrl,
      founderName: body.founderName,
      changes: body.changes,
      completeData: body.completeData,
      dataDate: body.dataDate,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to send notification' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending note notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}