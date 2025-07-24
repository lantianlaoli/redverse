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
  action: 'created' | 'updated';
  noteUrl?: string;
  changes?: {
    likes: { old: number; new: number; diff: number };
    collects: { old: number; new: number; diff: number };
    comments: { old: number; new: number; diff: number };
    views: { old: number; new: number; diff: number };
  };
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
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            .project-details {
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
            .cta-button {
              display: inline-block;
              background: #000000;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 10px 10px 10px 0;
              font-weight: 500;
            }
            .cta-button:hover {
              background: #333333;
            }
            .thumbnail {
              max-width: 100px;
              height: auto;
              border-radius: 6px;
              border: 1px solid #e1e5e9;
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
            <h1 style="margin: 0; font-size: 24px;">🚀 New Application Submitted</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Redverse Platform</p>
          </div>
          
          <div class="content">
            <p>A new application has been submitted to Redverse. Here are the details:</p>
            
            <div class="project-details">
              <h3 style="margin-top: 0; color: #333;">Project Details</h3>
              
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
            
            <div style="margin: 30px 0;">
              <h3>Quick Actions</h3>
              <a href="${data.adminDashboardUrl}" class="cta-button" target="_blank">
                View Admin Dashboard
              </a>
              <a href="${data.websiteUrl}" class="cta-button" target="_blank" style="background: #007bff;">
                Visit Project
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>Redverse Team</p>
            <p style="font-size: 12px; color: #999;">
              This is an automated notification from Redverse application submission system.
            </p>
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
      console.error('RESEND_API_KEY is not configured');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const isUpdate = data.action === 'updated' && data.changes;
    const actionText = data.action === 'created' ? 'Your App Featured on Xiaohongshu!' : 'Note Data Updated';
    const actionEmoji = data.action === 'created' ? '🎉' : '📊';

    let changesHtml = '';
    let changesText = '';
    
    if (isUpdate && data.changes) {
      const { likes, collects, comments, views } = data.changes;
      const hasIncrease = likes.diff > 0 || collects.diff > 0 || comments.diff > 0 || views.diff > 0;
      
      // Calculate percentage increases
      const likesPercent = likes.old > 0 ? Math.round((likes.diff / likes.old) * 100) : 0;
      const viewsPercent = views.old > 0 ? Math.round((views.diff / views.old) * 100) : 0;
      const collectsPercent = collects.old > 0 ? Math.round((collects.diff / collects.old) * 100) : 0;
      const commentsPercent = comments.old > 0 ? Math.round((comments.diff / comments.old) * 100) : 0;
      
      changesHtml = `
        <div class="metrics-container">
          <h3 class="metrics-title">📊 Performance Update</h3>
          <div class="metrics-list">
            ${likes.diff !== 0 ? `
            <div class="metric-item">
              <div class="metric-left">
                <div class="metric-icon">👍</div>
                <div class="metric-label">Likes</div>
              </div>
              <div class="metric-right">
                <div class="metric-values">
                  <span class="old-value">${likes.old.toLocaleString()}</span>
                  <span class="arrow">→</span>
                  <span class="new-value">${likes.new.toLocaleString()}</span>
                </div>
                <div class="metric-change ${likes.diff > 0 ? 'positive' : 'negative'}">
                  ${likes.diff > 0 ? '+' : ''}${likes.diff.toLocaleString()}
                  ${likes.old > 0 && likes.diff !== 0 ? ` (${likesPercent > 0 ? '+' : ''}${likesPercent}%)` : ''}
                </div>
              </div>
            </div>
            ` : ''}
            ${views.diff !== 0 ? `
            <div class="metric-item">
              <div class="metric-left">
                <div class="metric-icon">👀</div>
                <div class="metric-label">Views</div>
              </div>
              <div class="metric-right">
                <div class="metric-values">
                  <span class="old-value">${views.old.toLocaleString()}</span>
                  <span class="arrow">→</span>
                  <span class="new-value">${views.new.toLocaleString()}</span>
                </div>
                <div class="metric-change ${views.diff > 0 ? 'positive' : 'negative'}">
                  ${views.diff > 0 ? '+' : ''}${views.diff.toLocaleString()}
                  ${views.old > 0 && views.diff !== 0 ? ` (${viewsPercent > 0 ? '+' : ''}${viewsPercent}%)` : ''}
                </div>
              </div>
            </div>
            ` : ''}
            ${collects.diff !== 0 ? `
            <div class="metric-item">
              <div class="metric-left">
                <div class="metric-icon">⭐</div>
                <div class="metric-label">Collects</div>
              </div>
              <div class="metric-right">
                <div class="metric-values">
                  <span class="old-value">${collects.old.toLocaleString()}</span>
                  <span class="arrow">→</span>
                  <span class="new-value">${collects.new.toLocaleString()}</span>
                </div>
                <div class="metric-change ${collects.diff > 0 ? 'positive' : 'negative'}">
                  ${collects.diff > 0 ? '+' : ''}${collects.diff.toLocaleString()}
                  ${collects.old > 0 && collects.diff !== 0 ? ` (${collectsPercent > 0 ? '+' : ''}${collectsPercent}%)` : ''}
                </div>
              </div>
            </div>
            ` : ''}
            ${comments.diff !== 0 ? `
            <div class="metric-item">
              <div class="metric-left">
                <div class="metric-icon">💬</div>
                <div class="metric-label">Comments</div>
              </div>
              <div class="metric-right">
                <div class="metric-values">
                  <span class="old-value">${comments.old.toLocaleString()}</span>
                  <span class="arrow">→</span>
                  <span class="new-value">${comments.new.toLocaleString()}</span>
                </div>
                <div class="metric-change ${comments.diff > 0 ? 'positive' : 'negative'}">
                  ${comments.diff > 0 ? '+' : ''}${comments.diff.toLocaleString()}
                  ${comments.old > 0 && comments.diff !== 0 ? ` (${commentsPercent > 0 ? '+' : ''}${commentsPercent}%)` : ''}
                </div>
              </div>
            </div>
            ` : ''}
          </div>
          ${hasIncrease ? '<div class="success-banner">🎉 Amazing growth! Your app is gaining momentum on Xiaohongshu!</div>' : ''}
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
          <title>${actionText} - ${data.projectName}</title>
          <style>
            body {
              font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #37352f;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
            }
            .header {
              background: #ffffff;
              color: #37352f;
              padding: 32px 24px;
              border-radius: 8px 8px 0 0;
              text-align: center;
              border: 1px solid #e5e5e5;
              border-bottom: none;
            }
            .content {
              background: #ffffff;
              padding: 32px 24px;
              border: 1px solid #e5e5e5;
              border-top: none;
              border-bottom: none;
            }
            .metrics-container {
              background: #f8f8f8;
              padding: 20px;
              border-radius: 6px;
              margin: 24px 0;
              border: 1px solid #e5e5e5;
            }
            .metrics-title {
              font-size: 16px;
              font-weight: 600;
              color: #37352f;
              margin: 0 0 16px 0;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .metrics-list {
              display: flex;
              flex-direction: column;
              gap: 0;
            }
            .metric-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e5e5;
            }
            .metric-item:last-child {
              border-bottom: none;
            }
            .metric-left {
              display: flex;
              align-items: center;
              gap: 8px;
              flex: 1;
            }
            .metric-icon {
              font-size: 16px;
              width: 20px;
              text-align: center;
            }
            .metric-label {
              font-size: 14px;
              font-weight: 500;
              color: #37352f;
            }
            .metric-right {
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 14px;
            }
            .metric-values {
              color: #6b7280;
              font-weight: 400;
            }
            .old-value {
              color: #9ca3af;
            }
            .arrow {
              color: #9ca3af;
              margin: 0 2px;
            }
            .new-value {
              color: #37352f;
              font-weight: 500;
            }
            .metric-change {
              font-size: 13px;
              font-weight: 500;
              padding: 2px 6px;
              border-radius: 4px;
              min-width: 60px;
              text-align: center;
            }
            .metric-change.positive {
              background: #f0f9f4;
              color: #22c55e;
            }
            .metric-change.negative {
              background: #fef2f2;
              color: #ef4444;
            }
            .success-banner {
              background: #22c55e;
              color: white;
              padding: 12px 16px;
              border-radius: 6px;
              font-weight: 500;
              text-align: center;
              margin-top: 16px;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: #37352f;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 16px 16px 16px 0;
              font-weight: 500;
              font-size: 14px;
              border: 1px solid #37352f;
            }
            .cta-button:hover {
              background: #000000;
              border-color: #000000;
            }
            .footer {
              text-align: center;
              padding: 24px;
              color: #9ca3af;
              font-size: 13px;
              border-radius: 0 0 8px 8px;
              background: #f8f8f8;
              border: 1px solid #e5e5e5;
              border-top: none;
            }
            @media (max-width: 640px) {
              body { padding: 16px; }
              .header, .content { padding: 24px 16px; }
              .metrics-container { padding: 16px; margin: 20px 0; }
              .metric-item { flex-direction: column; align-items: flex-start; gap: 8px; }
              .metric-right { justify-content: space-between; width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 22px; font-weight: 600;">${actionEmoji} ${actionText}</h1>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">${data.projectName}</p>
          </div>
          
          <div class="content">
            <p>Hey there! 👋</p>
            <p>${data.action === 'created' 
              ? `Amazing news! <strong>${data.projectName}</strong> just got featured on Xiaohongshu! 🎉 This is huge - your app is now in front of millions of active users in China who love discovering cool new products.`
              : `We've got some fresh numbers for <strong>${data.projectName}</strong> on Xiaohongshu! Here's how your post is performing:`
            }</p>
            
            ${changesHtml}
            
            ${data.noteUrl ? `
            <div style="margin: 30px 0;">
              <a href="${data.noteUrl}" class="cta-button" target="_blank">
                View on Xiaohongshu
              </a>
            </div>
            ` : ''}
            
            ${data.action === 'created' ? `
            <p style="margin-top: 24px; padding: 16px; background-color: #f8f9fa; border-left: 3px solid #000; border-radius: 6px; color: #37352f;">
              <strong>💡 Quick tip:</strong> This is perfect content to share with your community and investors. Xiaohongshu exposure can be a real game-changer for market entry in China!
            </p>
            ` : `
            <p style="margin-top: 24px; color: #6b7280;">
              Keep up the great work! 🚀 These numbers show real people are discovering and engaging with your product.
            </p>
            `}
          </div>
          
          <div class="footer">
            <p>Best regards,<br>Redverse Team</p>
            <p style="font-size: 12px; color: #999;">
              This is an automated notification from Redverse.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
${actionText} - ${data.projectName}

Hey there! 👋

${data.action === 'created' 
  ? `Amazing news! ${data.projectName} just got featured on Xiaohongshu! 🎉 This is huge - your app is now in front of millions of active users in China who love discovering cool new products.`
  : `We've got some fresh numbers for ${data.projectName} on Xiaohongshu! Here's how your post is performing:`
}

${changesText}

${data.noteUrl ? `View on Xiaohongshu: ${data.noteUrl}` : ''}

${data.action === 'created' ? `
💡 Quick tip: This is perfect content to share with your community and investors. Xiaohongshu exposure can be a real game-changer for market entry in China!` : `
Keep up the great work! 🚀 These numbers show real people are discovering and engaging with your product.`}

Best regards,
Redverse Team
    `;

    const result = await resend.emails.send({
      from: 'Redverse <hello@redverse.online>',
      to: data.userEmail,
      subject: `${actionEmoji} ${actionText} - ${data.projectName}`,
      html: emailHtml,
      text: emailText,
    });

    console.log('Note notification email sent successfully:', result);
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Failed to send note notification email:', error);
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
          <title>User Feedback - Redverse</title>
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
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
            .feedback-content {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #4f46e5;
            }
            .user-details {
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
            .feedback-text {
              font-size: 16px;
              line-height: 1.6;
              color: #333;
              white-space: pre-wrap;
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
            <h1 style="margin: 0; font-size: 24px;">💬 New User Feedback</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Redverse Platform</p>
          </div>
          
          <div class="content">
            <p>A user has provided feedback about our services. Here are the details:</p>
            
            <div class="feedback-content">
              <h3 style="margin-top: 0; color: #4f46e5;">Feedback Content</h3>
              <div class="feedback-text">${data.feedbackText}</div>
            </div>
            
            <div class="user-details">
              <h3 style="margin-top: 0; color: #333;">User Information</h3>
              
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
            <p>Best regards,<br>Redverse Feedback System</p>
            <p style="font-size: 12px; color: #999;">
              This is an automated feedback notification from Redverse.
            </p>
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

    const result = await resend.emails.send({
      from: 'Redverse <hello@redverse.online>',
      to: process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com',
      subject: `💬 New User Feedback - ${data.userName}`,
      html: emailHtml,
      text: emailText,
    });

    console.log('Feedback email sent successfully:', result);
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Failed to send feedback email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}