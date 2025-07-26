'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { submitApplication, submitFeedback } from '@/lib/actions';
import { checkApplicationLimit } from '@/lib/subscription';

interface QuickSubmitProps {
  onSuccess?: () => void;
}

export function QuickSubmit({ onSuccess }: QuickSubmitProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'feedback' | 'feedback-success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittedApplication, setSubmittedApplication] = useState<{
    id: string;
    name: string;
    url: string;
  } | null>(null);
  const [userSubscriptionInfo, setUserSubscriptionInfo] = useState<{
    canSubmit: boolean;
    remainingCount: number;
    planName: string;
    isLoading: boolean;
  }>({
    canSubmit: true,
    remainingCount: -1,
    planName: 'basic',
    isLoading: true
  });

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const urlIsValid = isValidUrl(websiteUrl);
  const showValidation = websiteUrl.length > 0;

  // Fetch user subscription info when user is available
  useEffect(() => {
    if (user?.id) {
      checkApplicationLimit(user.id).then((result) => {
        if (result.success) {
          setUserSubscriptionInfo({
            canSubmit: result.canSubmit || false,
            remainingCount: result.remainingCount || 0,
            planName: result.subscription?.plan?.plan_name || 'basic',
            isLoading: false
          });
        } else {
          setUserSubscriptionInfo(prev => ({ ...prev, isLoading: false }));
        }
      });
    }
  }, [user?.id]);

  // Generate dynamic button text based on subscription status
  const getButtonText = () => {
    if (userSubscriptionInfo.isLoading) {
      return "Loading...";
    }
    
    if (!userSubscriptionInfo.canSubmit) {
      // User has reached their limit
      if (userSubscriptionInfo.planName === 'basic') {
        return "Submit Your Product - Upgrade to Pro";
      } else {
        return "Limit Reached - Contact Support";
      }
    }
    
    // User can still submit
    if (userSubscriptionInfo.planName === 'pro') {
      return "Submit Your Product - Pro";
    } else {
      return "Submit Your Product - Free";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlIsValid || submissionStatus === 'success') return;
    
    // Immediately set loading state for instant feedback
    setSubmissionStatus('submitting');
    setErrorMessage('');
    
    startTransition(async () => {
      // Create minimal FormData with just URL
      const submissionData = new FormData();
      submissionData.set('url', websiteUrl);
      
      const result = await submitApplication(submissionData);
      
      if (result.success) {
        setSubmissionStatus('success');
        setSubmittedApplication(result.application);
        onSuccess?.();
        
        // Switch to feedback mode after 3 seconds
        setTimeout(() => {
          setSubmissionStatus('feedback');
        }, 3000);
      } else {
        let errorMsg = result.error || 'Submission failed';
        
        if (errorMsg.includes('Invalid URL')) {
          errorMsg = 'Please enter a valid website URL (e.g., https://your-app.com)';
        } else if (errorMsg.includes('already submitted')) {
          errorMsg = 'You have already submitted this URL. Each URL can only be submitted once per user.';
        }
        
        setErrorMessage(errorMsg);
        setSubmissionStatus('error');
        
        // Auto-reset error after 5 seconds
        setTimeout(() => {
          setSubmissionStatus('idle');
        }, 5000);
      }
    });
  };

  const handleReset = useCallback(async () => {
    // If we're resetting from feedback state and there's a submitted application,
    // send the notification without feedback
    if (submissionStatus === 'feedback' && submittedApplication) {
      try {
        await submitFeedback('', submittedApplication);
        console.log('Notification sent without feedback');
      } catch (error) {
        console.error('Failed to send notification without feedback:', error);
      }
    }
    
    setSubmissionStatus('idle');
    setWebsiteUrl('');
    setErrorMessage('');
    setFeedbackText('');
    setSubmittedApplication(null);
  }, [submissionStatus, submittedApplication]);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    try {
      const result = await submitFeedback(feedbackText.trim(), submittedApplication);
      
      if (result.success) {
        setSubmissionStatus('feedback-success');
        
        // Auto-reset after 2 seconds
        setTimeout(() => {
          handleReset();
        }, 2000);
      } else {
        console.error('Feedback submission failed:', result.error);
        // Still show success to user even if email fails
        setSubmissionStatus('feedback-success');
        setTimeout(() => {
          handleReset();
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      // Still show success to user even if there's an error
      setSubmissionStatus('feedback-success');
      setTimeout(() => {
        handleReset();
      }, 2000);
    }
  };

  // Handle ESC key and auto-timeout for feedback mode
  useEffect(() => {
    if (submissionStatus === 'feedback') {
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleReset();
        }
      };

      // Auto-reset after 30 seconds if no action
      const timeout = setTimeout(() => {
        handleReset();
      }, 30000);

      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        clearTimeout(timeout);
      };
    }
  }, [submissionStatus, handleReset]);

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Integrated input-button design */}
        <div className="relative bg-white border-2 border-gray-200 rounded-full shadow-lg p-2 flex items-center">
          <input
            type="url"
            placeholder="Sign in to submit your product"
            disabled
            className="flex-1 px-4 py-3 text-gray-500 placeholder-gray-500 bg-transparent border-0 focus:outline-none text-lg"
          />
          <SignInButton mode="modal">
            <button className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fixed-size container to prevent layout jumping */}
        <div className={`relative transition-all duration-500 ease-in-out ${
          submissionStatus === 'feedback' || submissionStatus === 'feedback-success'
            ? 'rounded-2xl min-h-[320px] sm:min-h-[300px] bg-gray-50 border border-gray-200 shadow-sm p-0'
            : 'rounded-full min-h-[60px] shadow-lg p-2'
        } ${
          submissionStatus === 'feedback' || submissionStatus === 'feedback-success'
            ? ''
            : submissionStatus === 'success' 
            ? 'bg-gradient-to-r from-green-400 to-green-500 border-2 border-green-400' 
            : submissionStatus === 'submitting'
            ? 'bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-2 border-blue-300 shadow-blue-100'
            : submissionStatus === 'error'
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 shadow-red-100'
            : showValidation 
              ? urlIsValid 
                ? 'bg-white border-2 border-green-400 shadow-green-100' 
                : 'bg-white border-2 border-red-400 shadow-red-100'
              : 'bg-white border-2 border-gray-200 hover:border-gray-300'
        }`}>
          
          {/* Success State */}
          {submissionStatus === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                {/* Animated checkmark */}
                <div className="relative">
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{
                      animation: 'checkmarkScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-white">
                  <p className="text-lg font-semibold">Product Submitted!</p>
                  <p className="text-sm opacity-90">We&apos;ll review it and create your Xiaohongshu post</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {submissionStatus === 'submitting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                {/* Three bouncing dots */}
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" 
                       style={{ animation: 'dotBounce 1.4s ease-in-out infinite' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full" 
                       style={{ animation: 'dotBounce 1.4s ease-in-out infinite 0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full" 
                       style={{ animation: 'dotBounce 1.4s ease-in-out infinite 0.4s' }}></div>
                </div>
                
                {/* Simple text */}
                <div className="text-blue-700">
                  <p className="text-lg font-semibold">Submitting...</p>
                  <p className="text-sm opacity-80">Creating your application</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {submissionStatus === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="flex items-center space-x-3 w-full">
                {/* Animated error icon */}
                <div className="relative">
                  <svg 
                    className="w-8 h-8 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{
                      animation: 'errorShake 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-red-700 flex-1">
                  <p className="text-lg font-semibold">Submission Failed</p>
                  <p className="text-sm opacity-90 line-clamp-2">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                  title="Try again"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Feedback State - Notion Style */}
          {submissionStatus === 'feedback' && (
            <div className="absolute inset-0 p-6 sm:p-8">
              <div className="h-full flex flex-col justify-center">
                {/* Header Section */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm border border-gray-100">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Help us improve your experience
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto px-2">
                    What additional data insights would you find valuable beyond likes, saves, and comments?
                  </p>
                </div>
                
                {/* Input Section */}
                <div className="relative max-w-lg mx-auto w-full">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:ring-1 focus-within:ring-gray-200 transition-all duration-200">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your thoughts... e.g., conversion analytics, user demographics, competitor insights, growth recommendations"
                      className="w-full h-24 sm:h-28 px-4 py-4 text-gray-900 placeholder-gray-400 bg-transparent border-0 rounded-t-xl focus:outline-none resize-none text-sm leading-relaxed"
                      style={{ 
                        fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    />
                    
                    {/* Bottom Bar */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100 rounded-b-xl">
                      <div className="flex items-center text-xs text-gray-500 hidden sm:flex">
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Your feedback helps us build better features
                      </div>
                      
                      {/* Mobile hint */}
                      <div className="flex items-center text-xs text-gray-500 sm:hidden">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Thank you!
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleFeedbackSubmit()}
                        disabled={!feedbackText.trim()}
                        className="inline-flex items-center px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900 transition-all duration-150 shadow-sm"
                      >
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Success State - Notion Style */}
          {submissionStatus === 'feedback-success' && (
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6 shadow-sm border border-green-100">
                  <svg 
                    className="w-8 h-8 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{
                      animation: 'checkmarkScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Thanks for your feedback!</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto px-2">
                  We&apos;ll use your insights to build better analytics features for everyone
                </p>
              </div>
            </div>
          )}
          
          {/* Default Input State */}
          {submissionStatus === 'idle' && (
            <div className="flex items-center min-h-[56px]">
              <div className="relative flex-1 flex items-center">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-product.com"
                  required
                  className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none text-lg pr-10"
                />
                {/* Validation icon */}
                {showValidation && (
                  <div className="absolute right-3 flex items-center">
                    {urlIsValid ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending || !urlIsValid || userSubscriptionInfo.isLoading}
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
              >
                {getButtonText()}
              </button>
            </div>
          )}
        </div>
        
        {/* URL validation message - only for validation errors, not submission errors */}
        {showValidation && !urlIsValid && submissionStatus === 'idle' && (
          <p className="text-sm text-red-600 text-center">
            Please enter a valid URL (e.g., https://your-app.com)
          </p>
        )}
      </form>
      
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes checkmarkScale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes errorShake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

      `}</style>
    </div>
  );
}