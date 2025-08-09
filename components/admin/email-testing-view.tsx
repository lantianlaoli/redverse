'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { sendTestEmail } from '@/lib/actions';

type EmailType = 'application' | 'bug' | 'note_created' | 'note_updated' | 'note_report' | 'feedback';

interface TestStatus {
  loading: boolean;
  success: boolean | null;
  message: string;
}

const emailTypes = [
  {
    id: 'application' as EmailType,
    title: 'New Application Notification',
    description: 'Test the email sent when a new application is submitted',
    icon: '🚀',
  },
  {
    id: 'bug' as EmailType,
    title: 'Bug Report Email',
    description: 'Test the error report email when submission fails',
    icon: '🐛',
  },
  {
    id: 'note_created' as EmailType,
    title: 'Note Created Notification',
    description: 'Test the email sent when an app gets featured on Xiaohongshu',
    icon: '🎉',
  },
  {
    id: 'note_updated' as EmailType,
    title: 'Note Data Updated',
    description: 'Test the email sent when note metrics are updated (shows changes)',
    icon: '📊',
  },
  {
    id: 'note_report' as EmailType,
    title: 'Complete Data Report',
    description: 'Test the email sent with complete data (no changes needed)',
    icon: '📋',
  },
  {
    id: 'feedback' as EmailType,
    title: 'User Feedback Email',
    description: 'Test the email sent when users submit feedback',
    icon: '💬',
  },
];

export function EmailTestingView() {
  const [testStatuses, setTestStatuses] = useState<Record<EmailType, TestStatus>>({
    application: { loading: false, success: null, message: '' },
    bug: { loading: false, success: null, message: '' },
    note_created: { loading: false, success: null, message: '' },
    note_updated: { loading: false, success: null, message: '' },
    note_report: { loading: false, success: null, message: '' },
    feedback: { loading: false, success: null, message: '' },
  });

  const handleSendTest = async (emailType: EmailType) => {
    setTestStatuses(prev => ({
      ...prev,
      [emailType]: { loading: true, success: null, message: 'Sending test email...' }
    }));

    try {
      const result = await sendTestEmail(emailType);
      
      setTestStatuses(prev => ({
        ...prev,
        [emailType]: {
          loading: false,
          success: result.success,
          message: result.success ? 'Test email sent successfully!' : result.error || 'Failed to send test email'
        }
      }));

      // Clear status after 5 seconds
      setTimeout(() => {
        setTestStatuses(prev => ({
          ...prev,
          [emailType]: { loading: false, success: null, message: '' }
        }));
      }, 5000);

    } catch {
      setTestStatuses(prev => ({
        ...prev,
        [emailType]: {
          loading: false,
          success: false,
          message: 'An error occurred while sending the test email'
        }
      }));

      // Clear status after 5 seconds
      setTimeout(() => {
        setTestStatuses(prev => ({
          ...prev,
          [emailType]: { loading: false, success: null, message: '' }
        }));
      }, 5000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Testing</h1>
          <p className="text-gray-600">Test and debug different email templates by sending them to the admin email</p>
        </div>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emailTypes.map((emailType) => {
          const status = testStatuses[emailType.id];
          
          return (
            <div key={emailType.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{emailType.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{emailType.title}</h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {emailType.description}
              </p>

              {/* Status Display */}
              {status.message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                  status.success === true ? 'bg-green-50 text-green-700' :
                  status.success === false ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {status.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status.success === true ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status.success === false ? (
                    <XCircle className="w-4 h-4" />
                  ) : null}
                  <span className="text-sm">{status.message}</span>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={() => handleSendTest(emailType.id)}
                disabled={status.loading}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  status.loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {status.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{status.loading ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Email Testing Information</h4>
            <p className="text-sm text-blue-700">
              Test emails will be sent to the admin email address configured in the environment variables. 
              Each test uses realistic sample data to help you preview and debug the email templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}