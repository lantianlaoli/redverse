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
      from: 'Redverse <hello@mitesnap.com>',
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
      from: 'Redverse <hello@mitesnap.com>',
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