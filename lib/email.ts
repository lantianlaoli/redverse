import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface ApplicationNotificationData {
  projectName: string;
  websiteUrl: string;
  twitterUsername?: string;
  submitterEmail: string;
  submittedAt: string;
  thumbnailUrl?: string;
  adminDashboardUrl: string;
  userFeedback?: string;
}

interface BugReportData {
  error: string;
  userEmail: string;
  timestamp: string;
  submissionData: {
    projectName?: string;
    websiteUrl?: string;
    twitterUsername?: string;
  };
  userAgent?: string;
}

interface NoteNotificationData {
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

interface FeedbackData {
  feedbackText: string;
  userEmail: string;
  userName: string;
  submittedAt: string;
  applicationData?: {
    name: string;
    url: string;
    id: string;
  } | null;
}

// Note: UserReRegistrationData interface removed as it's not currently used

export async function sendNewApplicationNotification(data: ApplicationNotificationData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Application Submitted</title>
          <style>
            body {
              font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .email-container {
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .header {
              background: #ffffff;
              padding: 32px 32px 24px 32px;
              border-bottom: 1px solid #f3f4f6;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              line-height: 1.3;
            }
            .content {
              padding: 32px;
            }
            .project-details {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 24px;
              margin: 24px 0;
            }
            .detail-item {
              margin: 16px 0;
              padding: 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .label {
              font-weight: 600;
              color: #6b7280;
              display: inline-block;
              width: 120px;
              font-size: 14px;
            }
            .value {
              color: #111827;
              font-weight: 500;
            }
            .cta-button {
              display: inline-block;
              background: #111827;
              color: white !important;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 0 8px 8px 0;
              font-weight: 500;
              font-size: 14px;
              transition: all 0.2s ease;
            }
            .cta-button:hover {
              background: #000000;
              transform: translateY(-1px);
            }
            .cta-button-secondary {
              display: inline-block;
              background: #ffffff;
              color: #374151 !important;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 0 8px 8px 0;
              font-weight: 500;
              font-size: 14px;
              border: 1px solid #d1d5db;
              transition: all 0.2s ease;
            }
            .cta-button-secondary:hover {
              background: #f9fafb;
              border-color: #9ca3af;
              transform: translateY(-1px);
            }
            .thumbnail {
              max-width: 100px;
              height: auto;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .footer {
              background: #f8fafc;
              text-align: center;
              padding: 24px 32px;
              color: #6b7280;
              font-size: 13px;
              border-top: 1px solid #f3f4f6;
            }
            .footer p {
              margin: 0 0 8px 0;
            }
            @media only screen and (max-width: 640px) {
              body { padding: 12px !important; }
              .header, .content, .footer { padding: 24px 20px !important; }
              .cta-button, .cta-button-secondary { 
                display: block !important; 
                text-align: center !important; 
                margin: 8px 0 !important; 
                width: 100% !important;
                box-sizing: border-box !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🚀 New Application Submitted</h1>
            </div>
            
            <div class="content">
            <p>A new application has been submitted to Redverse. Here are the details:</p>
            
            <div class="project-details">
              <h3 style="margin-top: 0; color: #111827; font-size: 18px; font-weight: 600;">Project Details</h3>
              
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value"><strong>${data.projectName}</strong></span>
              </div>
              
              <div class="detail-item">
                <span class="label">Website:</span>
                <span class="value"><a href="${data.websiteUrl}" target="_blank">${data.websiteUrl}</a></span>
              </div>
              
              ${data.twitterUsername ? `
              <div class="detail-item">
                <span class="label">Twitter:</span>
                <span class="value"><a href="https://x.com/${data.twitterUsername}" target="_blank">@${data.twitterUsername}</a></span>
              </div>
              ` : ''}
              
              <div class="detail-item">
                <span class="label">Submitter:</span>
                <span class="value">${data.submitterEmail}</span>
              </div>
              
              <div class="detail-item">
                <span class="label">Submitted:</span>
                <span class="value">${data.submittedAt}</span>
              </div>
              
              ${data.thumbnailUrl ? `
              <div class="detail-item">
                <span class="label">Thumbnail:</span>
                <div style="margin-top: 10px;">
                  <img src="${data.thumbnailUrl}" alt="Project thumbnail" class="thumbnail">
                </div>
              </div>
              ` : ''}
            </div>
            
            <div class="project-details" style="border-left: 4px solid #111827; background: #f1f5f9;">
              <h3 style="margin-top: 0; color: #111827; font-size: 18px; font-weight: 600;">User Feedback</h3>
              <div style="font-size: 16px; line-height: 1.6; color: #374151; white-space: pre-wrap; font-weight: 500;">${data.userFeedback || "No feedback provided"}</div>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280; font-style: italic;">
                ${data.userFeedback && data.userFeedback !== "No feedback provided" 
                  ? "User provided additional insights about desired data analytics beyond standard metrics."
                  : "User completed the feedback flow without providing additional comments."}
              </p>
            </div>
            
            <div style="margin: 32px 0; text-align: center;">
              <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-bottom: 20px;">Quick Actions</h3>
              <a href="${data.adminDashboardUrl}" class="cta-button" target="_blank">
                View Admin Dashboard
              </a>
              <a href="${data.websiteUrl}" class="cta-button-secondary" target="_blank">
                Visit Project
              </a>
            </div>
          </div>
          
            <div class="footer">
              <p>Redverse</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New Application Submitted - ${data.projectName}

A new application has been submitted to Redverse:

Project Details:
• Name: ${data.projectName}
• Website: ${data.websiteUrl}
${data.twitterUsername ? `• Twitter: @${data.twitterUsername}` : ''}
• Submitter: ${data.submitterEmail}
• Submitted: ${data.submittedAt}
${data.thumbnailUrl ? `• Thumbnail: ${data.thumbnailUrl}` : ''}

User Feedback:
${data.userFeedback || "No feedback provided"}

Note: ${data.userFeedback && data.userFeedback !== "No feedback provided" 
  ? "User provided additional insights about desired data analytics beyond standard metrics."
  : "User completed the feedback flow without providing additional comments."}

Quick Actions:
• View Admin Dashboard: ${data.adminDashboardUrl}
• Visit Project: ${data.websiteUrl}

Best regards,
Redverse Team
    `;

    const result = await resend.emails.send({
      from: 'Redverse <hello@redverse.online>',
      to: process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com',
      subject: `New Application Submitted - ${data.projectName}`,
      html: emailHtml,
      text: emailText,
    });

    console.log('Email sent successfully:', result);
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Failed to send email notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendBugReportEmail(data: BugReportData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bug Report - Submission Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
              color: white;
              padding: 30px 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #ffffff;
              padding: 30px 20px;
              border: 1px solid #e1e5e9;
              border-top: none;
            }
            .error-details {
              background: #f8d7da;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #f5c6cb;
            }
            .submission-details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-item {
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e9ecef;
            }
            .detail-item:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #495057;
              display: inline-block;
              width: 120px;
            }
            .value {
              color: #333;
            }
            .error-message {
              background: #721c24;
              color: white;
              padding: 15px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 14px;
              word-break: break-all;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6c757d;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🐛 Bug Report - Submission Failed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Redverse Platform</p>
          </div>
          
          <div class="content">
            <p>A user encountered an error while submitting their application. Here are the details:</p>
            
            <div class="error-details">
              <h3 style="margin-top: 0; color: #721c24;">Error Details</h3>
              <div class="error-message">
                ${data.error}
              </div>
            </div>
            
            <div class="submission-details">
              <h3 style="margin-top: 0; color: #333;">User & Submission Details</h3>
              
              <div class="detail-item">
                <span class="label">User:</span>
                <span class="value">${data.userEmail}</span>
              </div>
              
              <div class="detail-item">
                <span class="label">Timestamp:</span>
                <span class="value">${data.timestamp}</span>
              </div>
              
              ${data.submissionData.projectName ? `
              <div class="detail-item">
                <span class="label">Project:</span>
                <span class="value">${data.submissionData.projectName}</span>
              </div>
              ` : ''}
              
              ${data.submissionData.websiteUrl ? `
              <div class="detail-item">
                <span class="label">Website:</span>
                <span class="value">${data.submissionData.websiteUrl}</span>
              </div>
              ` : ''}
              
              ${data.submissionData.twitterUsername ? `
              <div class="detail-item">
                <span class="label">Twitter:</span>
                <span class="value">@${data.submissionData.twitterUsername}</span>
              </div>
              ` : ''}
              
              ${data.userAgent ? `
              <div class="detail-item">
                <span class="label">User Agent:</span>
                <span class="value" style="font-size: 12px; word-break: break-all;">${data.userAgent}</span>
              </div>
              ` : ''}
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Action Required:</strong> Please investigate this error and consider reaching out to the user if needed.
            </p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>Redverse Bug Report System</p>
            <p style="font-size: 12px; color: #999;">
              This is an automated bug report from Redverse application submission system.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Bug Report - Submission Failed

A user encountered an error while submitting their application:

Error Details:
${data.error}

User & Submission Details:
• User: ${data.userEmail}
• Timestamp: ${data.timestamp}
${data.submissionData.projectName ? `• Project: ${data.submissionData.projectName}` : ''}
${data.submissionData.websiteUrl ? `• Website: ${data.submissionData.websiteUrl}` : ''}
${data.submissionData.twitterUsername ? `• Twitter: @${data.submissionData.twitterUsername}` : ''}
${data.userAgent ? `• User Agent: ${data.userAgent}` : ''}

Action Required: Please investigate this error and consider reaching out to the user if needed.

Best regards,
Redverse Bug Report System
    `;

    const result = await resend.emails.send({
      from: 'Redverse <hello@redverse.online>',
      to: process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com',
      subject: `🐛 Bug Report - Submission Failed (${data.userEmail})`,
      html: emailHtml,
      text: emailText,
    });

    console.log('Bug report email sent successfully:', result);
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Failed to send bug report email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendNoteNotification(data: NoteNotificationData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error(`[Email Service] RESEND_API_KEY not configured - cannot send email for project "${data.projectName}" to ${data.founderName || data.userEmail}`);
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const isUpdate = data.action === 'updated' && data.changes;
    const isReport = data.action === 'report';
    
    // Format date for display
    const displayDate = data.dataDate ? new Date(data.dataDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }) : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const actionText = data.action === 'created' 
      ? `${data.projectName} - Featured on Xiaohongshu!` 
      : isReport 
        ? `${data.projectName} - Data Report (${displayDate})` 
        : `${data.projectName} - Performance Update (${displayDate})`;

    let changesHtml = '';
    let changesText = '';
    
    // If we have complete data, use it; otherwise fall back to changes
    if (data.completeData) {
      // Use complete data to create display
      const { likes_count, collects_count, comments_count, views_count, shares_count } = data.completeData;
      
      // Calculate CES Score using Xiaohongshu algorithm: Likes×1 + Saves×1 + Comments×4 + Shares×4
      const cesScore = (likes_count * 1) + (collects_count * 1) + (comments_count * 4) + (shares_count * 4);
      
      changesHtml = `
        <div style="margin: 32px 0;">
          <!-- Main Layout Table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <!-- Left: CES Score Card -->
              <td class="mobile-stack" width="40%" valign="top" style="padding-right: 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 32px 24px; text-align: center;">
                      <div style="margin-bottom: 16px;">
                        <span style="font-size: 13px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.025em;">CES SCORE</span>
                      </div>
                      <div style="margin-bottom: 8px;">
                        <span style="font-size: 42px; font-weight: 800; color: #111827; line-height: 1; display: block;">${cesScore.toLocaleString()}</span>
                      </div>
                      <div>
                        <span style="font-size: 16px; font-weight: 600; color: #374151;">
                          Current Total
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
              
              <!-- Right: Individual Metrics -->
              <td class="mobile-stack" width="60%" valign="top" style="padding-left: 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-right: 6px; padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">LIKES</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${likes_count.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">Total</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-left: 6px; padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">VIEWS</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${views_count.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">Total</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-right: 6px; padding-top: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">SAVES</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${collects_count.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">Total</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-left: 6px; padding-top: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">COMMENTS</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${comments_count.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">Total</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `;
      
      changesText = `
Complete Data Report:
• Likes: ${likes_count.toLocaleString()}
• Views: ${views_count.toLocaleString()}
• Saves: ${collects_count.toLocaleString()}
• Comments: ${comments_count.toLocaleString()}
• Shares: ${shares_count.toLocaleString()}
• CES Score: ${cesScore.toLocaleString()}
      `;
    } else if (isUpdate && data.changes) {
      const { likes, collects, comments, views } = data.changes;
      const hasIncrease = likes.diff > 0 || collects.diff > 0 || comments.diff > 0 || views.diff > 0;
      
      // Calculate percentage increases
      const likesPercent = likes.old > 0 ? Math.round((likes.diff / likes.old) * 100) : 0;
      const viewsPercent = views.old > 0 ? Math.round((views.diff / views.old) * 100) : 0;
      const collectsPercent = collects.old > 0 ? Math.round((collects.diff / collects.old) * 100) : 0;
      const commentsPercent = comments.old > 0 ? Math.round((comments.diff / comments.old) * 100) : 0;
      
      // Calculate CES Score using Xiaohongshu algorithm: Likes×1 + Saves×1 + Comments×4 + Shares×4
      const oldCes = (likes.old * 1) + (collects.old * 1) + (comments.old * 4) + ((data.changes.shares?.old || 0) * 4);
      const newCes = (likes.new * 1) + (collects.new * 1) + (comments.new * 4) + ((data.changes.shares?.new || 0) * 4);
      const cesDiff = newCes - oldCes;
      const cesPercent = oldCes > 0 ? Math.round((cesDiff / oldCes) * 100) : 0;
      
      changesHtml = `
        <div style="margin: 32px 0;">
          <!-- Main Layout Table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <!-- Left: CES Score Card -->
              <td class="mobile-stack" width="40%" valign="top" style="padding-right: 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 32px 24px; text-align: center;">
                      <div style="margin-bottom: 16px;">
                        <span style="font-size: 13px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.025em;">CES SCORE</span>
                      </div>
                      <div style="margin-bottom: 8px;">
                        <span style="font-size: 42px; font-weight: 800; color: #111827; line-height: 1; display: block;">${newCes.toLocaleString()}</span>
                      </div>
                      <div>
                        <span style="font-size: 16px; font-weight: 600; color: ${cesDiff > 0 ? '#374151' : '#6b7280'};">
                          ${cesDiff > 0 ? '+' : ''}${cesDiff.toLocaleString()}
                          ${oldCes > 0 && cesDiff !== 0 ? ` (${cesPercent > 0 ? '+' : ''}${cesPercent}%)` : ''}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
              
              <!-- Right: Individual Metrics -->
              <td class="mobile-stack" width="60%" valign="top" style="padding-left: 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    ${likes.diff !== 0 ? `
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-right: 6px; padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">LIKES</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${likes.new.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">
                                ${likes.diff > 0 ? '+' : ''}${likes.diff.toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    ` : '<td class="mobile-metric-cell" width="50%" style="padding-right: 6px;"></td>'}
                    
                    ${views.diff !== 0 ? `
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-left: 6px; padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">VIEWS</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${views.new.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">
                                ${views.diff > 0 ? '+' : ''}${views.diff.toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    ` : '<td class="mobile-metric-cell" width="50%" style="padding-left: 6px;"></td>'}
                  </tr>
                  <tr>
                    ${collects.diff !== 0 ? `
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-right: 6px; padding-top: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">SAVES</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${collects.new.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">
                                ${collects.diff > 0 ? '+' : ''}${collects.diff.toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    ` : '<td class="mobile-metric-cell" width="50%" style="padding-right: 6px;"></td>'}
                    
                    ${comments.diff !== 0 ? `
                    <td class="mobile-metric-cell" width="50%" valign="top" style="padding-left: 6px; padding-top: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px;">
                            <div style="margin-bottom: 12px;">
                              <span style="font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.025em;">COMMENTS</span>
                            </div>
                            <div style="margin-bottom: 6px;">
                              <span style="font-size: 24px; font-weight: 700; color: #111827; line-height: 1; display: block;">${comments.new.toLocaleString()}</span>
                            </div>
                            <div>
                              <span style="font-size: 12px; font-weight: 500; color: #6b7280;">
                                ${comments.diff > 0 ? '+' : ''}${comments.diff.toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    ` : '<td class="mobile-metric-cell" width="50%" style="padding-left: 6px;"></td>'}
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `;
      
      changesText = `
Performance Update:
${likes.diff !== 0 ? `• Likes: ${likes.old.toLocaleString()} → ${likes.new.toLocaleString()} (${likes.diff > 0 ? '+' : ''}${likes.diff.toLocaleString()}${likes.old > 0 && likes.diff !== 0 ? `, ${likesPercent > 0 ? '+' : ''}${likesPercent}%` : ''})` : ''}
${views.diff !== 0 ? `• Views: ${views.old.toLocaleString()} → ${views.new.toLocaleString()} (${views.diff > 0 ? '+' : ''}${views.diff.toLocaleString()}${views.old > 0 && views.diff !== 0 ? `, ${viewsPercent > 0 ? '+' : ''}${viewsPercent}%` : ''})` : ''}
${collects.diff !== 0 ? `• Collects: ${collects.old.toLocaleString()} → ${collects.new.toLocaleString()} (${collects.diff > 0 ? '+' : ''}${collects.diff.toLocaleString()}${collects.old > 0 && collects.diff !== 0 ? `, ${collectsPercent > 0 ? '+' : ''}${collectsPercent}%` : ''})` : ''}
${comments.diff !== 0 ? `• Comments: ${comments.old.toLocaleString()} → ${comments.new.toLocaleString()} (${comments.diff > 0 ? '+' : ''}${comments.diff.toLocaleString()}${comments.old > 0 && comments.diff !== 0 ? `, ${commentsPercent > 0 ? '+' : ''}${commentsPercent}%` : ''})` : ''}
${hasIncrease ? '🎉 Amazing growth! Your app is gaining momentum on Xiaohongshu!' : ''}
      `;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${actionText}</title>
          <style>
            body {
              font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .email-container {
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .header {
              background: #ffffff;
              padding: 32px 32px 24px 32px;
              border-bottom: 1px solid #f3f4f6;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              line-height: 1.3;
            }
            .content {
              padding: 32px;
            }
            .greeting {
              font-size: 16px;
              color: #374151;
              margin-bottom: 20px;
            }
            .description {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 32px;
              line-height: 1.6;
            }
            /* Email-compatible styles - minimal CSS due to inline styles */
            table {
              border-collapse: collapse;
            }
            .mobile-stack {
              display: table-cell;
            }
            .success-banner {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 16px 20px;
              border-radius: 8px;
              font-weight: 500;
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            .cta-section {
              margin: 32px 0;
              text-align: center;
            }
            .cta-button {
              display: inline-block;
              background: #111827;
              color: white !important;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 0 8px 8px 0;
              font-weight: 500;
              font-size: 14px;
              border: none;
              transition: all 0.2s ease;
            }
            .cta-button:hover {
              background: #000000;
              transform: translateY(-1px);
            }
            .cta-button-secondary {
              display: inline-block;
              background: #ffffff;
              color: #374151 !important;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 0 8px 8px 0;
              font-weight: 500;
              font-size: 14px;
              border: 1px solid #d1d5db;
              transition: all 0.2s ease;
            }
            .cta-button-secondary:hover {
              background: #f9fafb;
              border-color: #9ca3af;
              transform: translateY(-1px);
            }
            .cta-button-tertiary {
              display: inline-block;
              background: #ffffff;
              color: #6b7280 !important;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 0 8px 8px 0;
              font-weight: 500;
              font-size: 14px;
              border: 1px solid #e5e7eb;
              transition: all 0.2s ease;
            }
            .cta-button-tertiary:hover {
              background: #f9fafb;
              border-color: #d1d5db;
              transform: translateY(-1px);
            }
            .tip-section {
              background: #f8fafc;
              border-left: 4px solid #3b82f6;
              border-radius: 0 6px 6px 0;
              padding: 16px 20px;
              margin: 24px 0;
            }
            .tip-section strong {
              color: #1e40af;
            }
            .footer {
              background: #f8fafc;
              text-align: center;
              padding: 24px 32px;
              color: #6b7280;
              font-size: 13px;
              border-top: 1px solid #f3f4f6;
            }
            .footer p {
              margin: 0 0 8px 0;
            }
            @media only screen and (max-width: 640px) {
              body { padding: 12px !important; }
              .header, .content, .footer { padding: 24px 20px !important; }
              /* Stack layout on mobile */
              .mobile-stack {
                display: block !important;
                width: 100% !important;
                padding: 0 !important;
                margin-bottom: 20px !important;
              }
              /* Stack metric cells vertically on mobile */
              .mobile-metric-cell {
                display: block !important;
                width: 100% !important;
                padding: 6px 0 !important;
              }
              .cta-button, .cta-button-secondary, .cta-button-tertiary { 
                display: block !important; 
                text-align: center !important; 
                margin: 8px 0 !important; 
                width: 100% !important;
                box-sizing: border-box !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>${actionText}</h1>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hello ${data.founderName ? data.founderName : 'there'}!
              </div>
              
              <div class="description">
                ${data.action === 'created' 
                  ? `<strong>${data.projectName}</strong> is now featured on Xiaohongshu.`
                  : data.action === 'report'
                    ? `Here's the complete performance data for <strong>${data.projectName}</strong> as of <strong>${displayDate}</strong>:`
                    : `Performance update for <strong>${data.projectName}</strong> as of <strong>${displayDate}</strong>:`
                }
              </div>
              
              ${changesHtml}
              
              <div class="cta-section">
                ${data.noteUrl ? `
                <a href="${data.noteUrl}" class="cta-button" target="_blank">
                  View on Xiaohongshu
                </a>
                ` : ''}
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://redverse.online'}/dashboard" class="cta-button-secondary" target="_blank">
                  View Dashboard
                </a>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://redverse.online'}/guides" class="cta-button-tertiary" target="_blank">
                  Learn about CES
                </a>
              </div>
              
            </div>
            
            <div class="footer">
              <p>Redverse</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
${actionText}

Hello ${data.founderName ? data.founderName : 'there'}!

${data.action === 'created' 
  ? `${data.projectName} is now featured on Xiaohongshu.`
  : data.action === 'report'
    ? `Here's the complete performance data for ${data.projectName} as of ${displayDate}:`
    : `Performance update for ${data.projectName} as of ${displayDate}:`
}

${changesText}

${data.noteUrl ? `View on Xiaohongshu: ${data.noteUrl}` : ''}
View Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://redverse.online'}/dashboard

Redverse
    `;

    await resend.emails.send({
      from: 'Redverse <hello@redverse.online>',
      to: data.userEmail,
      subject: actionText,
      html: emailHtml,
      text: emailText,
    });
    
    return {
      success: true
    };

  } catch (error) {
    console.error(`[Email Service] Email sending failed - project: "${data.projectName}", founder: ${data.founderName || data.userEmail}, error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendFeedbackEmail(data: FeedbackData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('Debug: Starting feedback email send', {
      userName: data.userName,
      userEmail: data.userEmail,
      feedbackLength: data.feedbackText.length,
      hasApplicationData: !!data.applicationData,
      submittedAt: data.submittedAt
    });

    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com';
    console.log('Debug: Email configuration', {
      hasApiKey: !!process.env.RESEND_API_KEY,
      adminEmail: adminEmail
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>User Feedback - Redverse</title>
          <style>
            body {
              font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .email-container {
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .header {
              background: #ffffff;
              padding: 32px 32px 24px 32px;
              border-bottom: 1px solid #f3f4f6;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              line-height: 1.3;
            }
            .content {
              padding: 32px;
            }
            .feedback-content {
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              padding: 24px;
              border-radius: 8px;
              margin: 24px 0;
              border-left: 4px solid #111827;
            }
            .user-details {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 24px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .detail-item {
              margin: 16px 0;
              padding: 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .label {
              font-weight: 600;
              color: #6b7280;
              display: inline-block;
              width: 120px;
              font-size: 14px;
            }
            .value {
              color: #111827;
              font-weight: 500;
            }
            .feedback-text {
              font-size: 16px;
              line-height: 1.6;
              color: #374151;
              white-space: pre-wrap;
              font-weight: 500;
            }
            .footer {
              background: #f8fafc;
              text-align: center;
              padding: 24px 32px;
              color: #6b7280;
              font-size: 13px;
              border-top: 1px solid #f3f4f6;
            }
            .footer p {
              margin: 0 0 8px 0;
            }
            @media only screen and (max-width: 640px) {
              body { padding: 12px !important; }
              .header, .content, .footer { padding: 24px 20px !important; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>💬 New User Feedback</h1>
            </div>
            
            <div class="content">
            <p>A user has provided feedback about our services. Here are the details:</p>
            
            <div class="feedback-content">
              <h3 style="margin-top: 0; color: #111827; font-size: 18px; font-weight: 600;">Feedback Content</h3>
              <div class="feedback-text">${data.feedbackText}</div>
            </div>
            
            <div class="user-details">
              <h3 style="margin-top: 0; color: #111827; font-size: 18px; font-weight: 600;">User Information</h3>
              
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value">${data.userName}</span>
              </div>
              
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">${data.userEmail}</span>
              </div>
              
              <div class="detail-item">
                <span class="label">Submitted:</span>
                <span class="value">${data.submittedAt}</span>
              </div>
              
              ${data.applicationData ? `
              <div class="detail-item">
                <span class="label">Project:</span>
                <span class="value">${data.applicationData.name}</span>
              </div>
              
              <div class="detail-item">
                <span class="label">Project URL:</span>
                <span class="value"><a href="${data.applicationData.url}" target="_blank">${data.applicationData.url}</a></span>
              </div>
              ` : ''}
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Action Required:</strong> Please review this feedback and consider implementing requested improvements or reaching out to the user for follow-up.
            </p>
          </div>
          
            <div class="footer">
              <p>Redverse</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
New User Feedback - Redverse

A user has provided feedback about our services:

Feedback Content:
${data.feedbackText}

User Information:
• Name: ${data.userName}
• Email: ${data.userEmail}
• Submitted: ${data.submittedAt}
${data.applicationData ? `• Project: ${data.applicationData.name}` : ''}
${data.applicationData ? `• Project URL: ${data.applicationData.url}` : ''}

Action Required: Please review this feedback and consider implementing requested improvements or reaching out to the user for follow-up.

Best regards,
Redverse Feedback System
    `;

    console.log('Debug: Sending email with Resend API', {
      from: 'Redverse <hello@redverse.online>',
      to: adminEmail,
      subject: `💬 New User Feedback - ${data.userName}`,
      htmlLength: emailHtml.length,
      textLength: emailText.length
    });

    const result = await resend.emails.send({
      from: 'Redverse <hello@redverse.online>',
      to: adminEmail,
      subject: `💬 New User Feedback - ${data.userName}`,
      html: emailHtml,
      text: emailText,
    });

    console.log('Debug: Feedback email sent successfully', { 
      result,
      messageId: result.data?.id,
      userName: data.userName 
    });
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Debug: Failed to send feedback email', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      userName: data?.userName,
      userEmail: data?.userEmail,
      feedbackLength: data?.feedbackText?.length
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}