'use client';

import Link from 'next/link';

interface SubmissionSuccessProps {
  onReset?: () => void;
}

export function SubmissionSuccess({ onReset }: SubmissionSuccessProps) {
  return (
    <div className="mx-auto max-w-2xl text-center py-12">
      {/* Success Icon */}
      <div className="mx-auto flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Application Submitted Successfully!
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        Your AI application has been submitted and is now in our review queue. We&apos;ll process it soon and notify you of any updates.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/dashboard">
          <button className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer">
            View My Applications
          </button>
        </Link>
        <button
          onClick={onReset}
          className="rounded-full border border-gray-300 px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Submit Another Application
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>What&apos;s next?</strong> Our team will review your application and, if approved, we&apos;ll create engaging content for Xiaohongshu to showcase your AI innovation to millions of Chinese users.
        </p>
      </div>
    </div>
  );
}