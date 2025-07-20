'use client';

import { useState, useTransition } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { submitApplication } from '@/lib/actions';

interface QuickSubmitProps {
  onSuccess?: () => void;
}

export function QuickSubmit({ onSuccess }: QuickSubmitProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
        onSuccess?.();
        
        // Auto-reset after 5 seconds
        setTimeout(() => {
          setSubmissionStatus('idle');
          setWebsiteUrl('');
        }, 5000);
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

  const handleReset = () => {
    setSubmissionStatus('idle');
    setWebsiteUrl('');
    setErrorMessage('');
  };

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
        {/* Adaptive container that transforms based on status */}
        <div className={`relative rounded-full shadow-lg p-2 transition-all duration-500 ease-in-out ${
          submissionStatus === 'success' 
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
            <div className="flex items-center justify-center py-4 px-6">
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
            <div className="flex items-center justify-center py-4 px-6">
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
            <div className="flex items-center justify-center py-4 px-6">
              <div className="flex items-center space-x-3">
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
          
          {/* Default Input State */}
          {submissionStatus === 'idle' && (
            <div className="flex items-center">
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
                disabled={isPending || !urlIsValid}
                className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
              >
                Submit Your Product - Free
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