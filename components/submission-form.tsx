'use client';

import { useState, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { submitApplication } from '@/lib/actions';

interface SubmissionFormProps {
  onSuccess?: () => void;
}

export function SubmissionForm({ onSuccess }: SubmissionFormProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      setMessage(null);
      
      const result = await submitApplication(formData);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Submission successful! Your AI application has entered our review queue.'
        });
        onSuccess?.();
        // Reset form
        const form = document.getElementById('submission-form') as HTMLFormElement;
        form?.reset();
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Submission failed'
        });
      }
    });
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <button className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors">
          Submit Application
        </button>
        <button className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors">
          View Examples
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form id="submission-form" action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL *
            </label>
            <input
              type="url"
              id="url"
              name="url"
              required
              placeholder="https://your-ai-app.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Your AI App Name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="twitter_id" className="block text-sm font-medium text-gray-700 mb-2">
            Twitter Username <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            id="twitter_id"
            name="twitter_id"
            placeholder="your_twitter_handle"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Submitting...' : 'Submit Application'}
          </button>
          <button 
            type="button"
            className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            View Examples
          </button>
        </div>

        {message && (
          <div className={`rounded-lg p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
            {message.type === 'success' && (
              <p className="text-xs mt-2 text-green-600">
                Please follow our official Xiaohongshu account - your project will be featured here first once it goes live!
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}