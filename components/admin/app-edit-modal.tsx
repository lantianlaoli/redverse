'use client';

import { useState, useEffect } from 'react';
import { updateApplication } from '@/lib/actions';
import { Application } from '@/lib/supabase';
import Image from 'next/image';
import { Upload, X, AlertCircle } from 'lucide-react';

interface AppEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  application: Application;
}

export function AppEditModal({ isOpen, onClose, onSuccess, application }: AppEditModalProps) {
  const [formData, setFormData] = useState({
    name: application.name || '',
    twitter_id: application.twitter_id || '',
    explain: application.explain || '',
    image: null as File | null,
    current_image: application.image || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(application.image || '');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: application.name || '',
        twitter_id: application.twitter_id || '',
        explain: application.explain || '',
        image: null,
        current_image: application.image || ''
      });
      setImagePreview(application.image || '');
      setError('');
    }
  }, [isOpen, application]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      current_image: ''
    }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Application name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('twitter_id', formData.twitter_id.trim());
      submitFormData.append('explain', formData.explain.trim());
      
      if (formData.image) {
        submitFormData.append('image', formData.image);
      } else if (formData.current_image) {
        submitFormData.append('current_image', formData.current_image);
      }

      const result = await updateApplication(application.id, submitFormData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get missing fields for display
  const getMissingFields = () => {
    const missing = [];
    if (!application.twitter_id) missing.push('Twitter ID');
    if (!application.image) missing.push('Image');
    if (!application.explain) missing.push('Description');
    return missing;
  };

  const missingFields = getMissingFields();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Application
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Missing Fields Warning */}
          {missingFields.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Missing Fields</p>
                  <p className="text-xs text-amber-700 mt-1">
                    {missingFields.join(', ')} {missingFields.length === 1 ? 'is' : 'are'} missing
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Application Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Application Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Twitter ID */}
            <div>
              <label htmlFor="twitter_id" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter ID
                {!application.twitter_id && <span className="text-amber-500 ml-1">●</span>}
              </label>
              <input
                type="text"
                id="twitter_id"
                name="twitter_id"
                value={formData.twitter_id}
                onChange={handleInputChange}
                placeholder="e.g. @username or username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
                {!application.image && <span className="text-amber-500 ml-1">●</span>}
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <div className="w-full h-32 rounded-md overflow-hidden border border-gray-300">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      width={300}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload product image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label htmlFor="explain" className="block text-sm font-medium text-gray-700 mb-1">
                Product Description
                {!application.explain && <span className="text-amber-500 ml-1">●</span>}
              </label>
              <textarea
                id="explain"
                name="explain"
                value={formData.explain}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of the product..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </form>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}