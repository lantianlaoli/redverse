'use client';

import { useState, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { submitApplication } from '@/lib/actions';
import Image from 'next/image';
import { SubmissionSuccess } from './submission-success';

interface SubmissionFormProps {
  onSuccess?: () => void;
}

export function SubmissionForm({ }: SubmissionFormProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [projectName, setProjectName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const extractProjectName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      const domain = hostname.split('.')[0];
      return domain;
    } catch {
      return '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setWebsiteUrl(url);
    if (url && !projectName) {
      const extractedName = extractProjectName(url);
      if (extractedName) {
        setProjectName(extractedName);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'Image size must be less than 2MB'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({
          type: 'error',
          text: 'File must be an image'
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    startTransition(async () => {
      setMessage(null);
      
      // Create FormData with controlled component values
      const submissionData = new FormData();
      submissionData.set('url', websiteUrl);
      submissionData.set('name', projectName);
      submissionData.set('twitter_id', twitterUsername);
      
      // Add the selected image to FormData
      if (selectedImage) {
        submissionData.set('thumbnail', selectedImage);
      }
      
      const result = await submitApplication(submissionData);
      
      if (result.success) {
        setShowSuccess(true);
        // Don't call onSuccess here - we want user to manually navigate
      } else {
        // Provide more specific error messages based on error content
        let errorMessage = result.error || 'Submission failed';
        
        if (errorMessage.includes('Storage upload failed') || errorMessage.includes('Failed to upload')) {
          errorMessage = `Image upload failed: ${errorMessage}. Please try uploading a different image or check your internet connection.`;
        } else if (errorMessage.includes('row-level security policy')) {
          errorMessage = 'Database permission error. Please try signing out and signing back in, then try again.';
        } else if (errorMessage.includes('Invalid URL')) {
          errorMessage = 'Please enter a valid website URL (e.g., https://your-app.com)';
        } else if (errorMessage.includes('File size')) {
          errorMessage = 'Image file is too large. Please upload an image smaller than 2MB.';
        } else if (errorMessage.includes('File must be an image')) {
          errorMessage = 'Please upload a valid image file (JPG, PNG, GIF, etc.)';
        } else if (errorMessage.includes('already submitted')) {
          errorMessage = 'You have already submitted this application. Each URL can only be submitted once per user.';
        }
        
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
    });
  };

  const handleReset = () => {
    setShowSuccess(false);
    setMessage(null);
    setProjectName('');
    setWebsiteUrl('');
    setTwitterUsername('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (!user) {
    return (
      <div className="flex items-center">
        <button className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer">
          Submit Application
        </button>
      </div>
    );
  }

  if (showSuccess) {
    return <SubmissionSuccess onReset={handleReset} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form 
        id="submission-form" 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }} 
        className="space-y-6"
      >
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
              value={websiteUrl}
              placeholder="https://your-ai-app.com"
              onChange={handleUrlChange}
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
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Your AI App Name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="twitter_id" className="block text-sm font-medium text-gray-700 mb-2">
            Twitter Username *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-base">@</span>
            </div>
            <input
              type="text"
              id="twitter_id"
              name="twitter_id"
              required
              value={twitterUsername}
              onChange={(e) => setTwitterUsername(e.target.value)}
              placeholder="username"
              className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Thumbnail *
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer hover:border-gray-400 ${
              imagePreview ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => document.getElementById('thumbnail')?.click()}
          >
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="hidden"
            />
            
            {imagePreview ? (
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {selectedImage?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click to change image
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="w-12 h-12 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    Click to upload product image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isPending ? 'Submitting...' : 'Submit Application'}
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