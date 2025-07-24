'use client';

import { useState, useTransition, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { submitApplication, submitFeedback } from '@/lib/actions';

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

  const handleReset = () => {
    setSubmissionStatus('idle');
    setWebsiteUrl('');
    setErrorMessage('');
    setFeedbackText('');
    setSubmittedApplication(null);
  };

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
  }, [submissionStatus]);

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
        <div className={`relative shadow-lg p-2 transition-all duration-500 ease-in-out ${
          submissionStatus === 'feedback' || submissionStatus === 'feedback-success'
            ? 'rounded-2xl min-h-[200px] bg-white border-2 border-gray-200'
            : 'rounded-full min-h-[60px]'
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
            <>
              {/* Celebration ribbons - left side */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`left-${i}`}
                    className="absolute w-3 h-12 rounded-sm"
                    style={{
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i],
                      animation: `ribbonLeft${i} 1.5s ease-out`,
                      animationDelay: `${i * 0.15}s`,
                      transformOrigin: 'center top'
                    }}
                  />
                ))}
              </div>
              
              {/* Celebration ribbons - right side */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`right-${i}`}
                    className="absolute w-3 h-12 rounded-sm"
                    style={{
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i],
                      animation: `ribbonRight${i} 1.5s ease-out`,
                      animationDelay: `${i * 0.15}s`,
                      transformOrigin: 'center top'
                    }}
                  />
                ))}
              </div>
              
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
            </>
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

          {/* Feedback State */}
          {submissionStatus === 'feedback' && (
            <div 
              className="absolute inset-0 p-4 cursor-default"
              onClick={(e) => {
                // Only close if clicking the background, not the content
                if (e.target === e.currentTarget) {
                  handleReset();
                }
              }}
            >
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-left">
                  <h3 className="text-base font-medium text-gray-800 mb-1">
                    Help us improve your experience
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    What additional data insights would you find valuable beyond likes, saves, and comments?
                  </p>
                </div>
                
                <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors focus-within:border-gray-400 focus-within:shadow-md">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="e.g., conversion analytics, user demographics, competitor insights, growth recommendations..."
                    className="w-full h-20 px-3 py-3 text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none resize-none text-sm leading-relaxed"
                  />
                  
                  <div className="flex justify-end p-2 border-t border-gray-100 bg-gray-50/50">
                    <button
                      type="button"
                      onClick={() => handleFeedbackSubmit()}
                      disabled={!feedbackText.trim()}
                      className="bg-gray-900 text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                    >
                      Submit feedback
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-400">Press ESC to skip</p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Success State */}
          {submissionStatus === 'feedback-success' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-3">
                  <svg 
                    className="w-8 h-8 text-green-500 mx-auto" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{
                      animation: 'checkmarkScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Thanks for your feedback!</h3>
                <p className="text-sm text-gray-500">We&apos;ll use your insights to improve our service</p>
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

        /* Ribbon animations - Left side */
        @keyframes ribbonLeft0 {
          0% { 
            transform: translate(0, -50px) rotate(-10deg) scaleY(0); 
            opacity: 1; 
          }
          30% { 
            transform: translate(-30px, 0) rotate(-15deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-120px, 100px) rotate(-25deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonLeft1 {
          0% { 
            transform: translate(0, -40px) rotate(5deg) scaleY(0); 
            opacity: 1; 
          }
          35% { 
            transform: translate(-25px, 10px) rotate(0deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-100px, 120px) rotate(20deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonLeft2 {
          0% { 
            transform: translate(0, -60px) rotate(-20deg) scaleY(0); 
            opacity: 1; 
          }
          25% { 
            transform: translate(-40px, -10px) rotate(-25deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-140px, 90px) rotate(-35deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonLeft3 {
          0% { 
            transform: translate(0, -30px) rotate(15deg) scaleY(0); 
            opacity: 1; 
          }
          40% { 
            transform: translate(-20px, 20px) rotate(10deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-80px, 110px) rotate(30deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonLeft4 {
          0% { 
            transform: translate(0, -45px) rotate(-5deg) scaleY(0); 
            opacity: 1; 
          }
          32% { 
            transform: translate(-35px, 5px) rotate(-10deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-110px, 115px) rotate(-15deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonLeft5 {
          0% { 
            transform: translate(0, -55px) rotate(25deg) scaleY(0); 
            opacity: 1; 
          }
          28% { 
            transform: translate(-45px, -5px) rotate(20deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-90px, 105px) rotate(40deg) scaleY(1); 
            opacity: 0; 
          }
        }

        /* Ribbon animations - Right side */
        @keyframes ribbonRight0 {
          0% { 
            transform: translate(0, -50px) rotate(10deg) scaleY(0); 
            opacity: 1; 
          }
          30% { 
            transform: translate(30px, 0) rotate(15deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(120px, 100px) rotate(25deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonRight1 {
          0% { 
            transform: translate(0, -40px) rotate(-5deg) scaleY(0); 
            opacity: 1; 
          }
          35% { 
            transform: translate(25px, 10px) rotate(0deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(100px, 120px) rotate(-20deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonRight2 {
          0% { 
            transform: translate(0, -60px) rotate(20deg) scaleY(0); 
            opacity: 1; 
          }
          25% { 
            transform: translate(40px, -10px) rotate(25deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(140px, 90px) rotate(35deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonRight3 {
          0% { 
            transform: translate(0, -30px) rotate(-15deg) scaleY(0); 
            opacity: 1; 
          }
          40% { 
            transform: translate(20px, 20px) rotate(-10deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(80px, 110px) rotate(-30deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonRight4 {
          0% { 
            transform: translate(0, -45px) rotate(5deg) scaleY(0); 
            opacity: 1; 
          }
          32% { 
            transform: translate(35px, 5px) rotate(10deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(110px, 115px) rotate(15deg) scaleY(1); 
            opacity: 0; 
          }
        }
        @keyframes ribbonRight5 {
          0% { 
            transform: translate(0, -55px) rotate(-25deg) scaleY(0); 
            opacity: 1; 
          }
          28% { 
            transform: translate(45px, -5px) rotate(-20deg) scaleY(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(90px, 105px) rotate(-40deg) scaleY(1); 
            opacity: 0; 
          }
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          @keyframes ribbonLeft0 {
            0% { transform: translate(0, -30px) rotate(-10deg) scaleY(0); opacity: 1; }
            30% { transform: translate(-20px, 0) rotate(-15deg) scaleY(1); opacity: 1; }
            100% { transform: translate(-80px, 60px) rotate(-25deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonLeft1 {
            0% { transform: translate(0, -25px) rotate(5deg) scaleY(0); opacity: 1; }
            35% { transform: translate(-15px, 5px) rotate(0deg) scaleY(1); opacity: 1; }
            100% { transform: translate(-60px, 70px) rotate(20deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonLeft2 {
            0% { transform: translate(0, -35px) rotate(-20deg) scaleY(0); opacity: 1; }
            25% { transform: translate(-25px, -5px) rotate(-25deg) scaleY(1); opacity: 1; }
            100% { transform: translate(-90px, 55px) rotate(-35deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonLeft3 {
            0% { transform: translate(0, -20px) rotate(15deg) scaleY(0); opacity: 1; }
            40% { transform: translate(-12px, 10px) rotate(10deg) scaleY(1); opacity: 1; }
            100% { transform: translate(-50px, 65px) rotate(30deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonLeft4 {
            0% { transform: translate(0, -28px) rotate(-5deg) scaleY(0); opacity: 1; }
            32% { transform: translate(-22px, 2px) rotate(-10deg) scaleY(1); opacity: 1; }
            100% { transform: translate(-70px, 68px) rotate(-15deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonLeft5 {
            0% { transform: translate(0, -32px) rotate(25deg) scaleY(0); opacity: 1; }
            28% { transform: translate(-28px, -2px) rotate(20deg) scaleY(1); opacity: 1; }
            100% { transform: translate(-60px, 62px) rotate(40deg) scaleY(1); opacity: 0; }
          }
          
          @keyframes ribbonRight0 {
            0% { transform: translate(0, -30px) rotate(10deg) scaleY(0); opacity: 1; }
            30% { transform: translate(20px, 0) rotate(15deg) scaleY(1); opacity: 1; }
            100% { transform: translate(80px, 60px) rotate(25deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonRight1 {
            0% { transform: translate(0, -25px) rotate(-5deg) scaleY(0); opacity: 1; }
            35% { transform: translate(15px, 5px) rotate(0deg) scaleY(1); opacity: 1; }
            100% { transform: translate(60px, 70px) rotate(-20deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonRight2 {
            0% { transform: translate(0, -35px) rotate(20deg) scaleY(0); opacity: 1; }
            25% { transform: translate(25px, -5px) rotate(25deg) scaleY(1); opacity: 1; }
            100% { transform: translate(90px, 55px) rotate(35deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonRight3 {
            0% { transform: translate(0, -20px) rotate(-15deg) scaleY(0); opacity: 1; }
            40% { transform: translate(12px, 10px) rotate(-10deg) scaleY(1); opacity: 1; }
            100% { transform: translate(50px, 65px) rotate(-30deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonRight4 {
            0% { transform: translate(0, -28px) rotate(5deg) scaleY(0); opacity: 1; }
            32% { transform: translate(22px, 2px) rotate(10deg) scaleY(1); opacity: 1; }
            100% { transform: translate(70px, 68px) rotate(15deg) scaleY(1); opacity: 0; }
          }
          @keyframes ribbonRight5 {
            0% { transform: translate(0, -32px) rotate(-25deg) scaleY(0); opacity: 1; }
            28% { transform: translate(28px, -2px) rotate(-20deg) scaleY(1); opacity: 1; }
            100% { transform: translate(60px, 62px) rotate(-40deg) scaleY(1); opacity: 0; }
          }
        }
      `}</style>
    </div>
  );
}