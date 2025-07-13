'use client';

import { useState } from 'react';
import { createNote, updateNote, deleteNote } from '@/lib/actions';
import { Note } from '@/lib/supabase';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appId: string;
  note?: Note | null;
  mode: 'create' | 'edit';
}

export function NoteModal({ isOpen, onClose, onSuccess, appId, note, mode }: NoteModalProps) {
  const [formData, setFormData] = useState({
    url: note?.url || '',
    publish_date: note?.publish_date ? new Date(note.publish_date).toISOString().split('T')[0] : '',
    likes_count: note?.likes_count?.toString() || '0',
    collects_count: note?.collects_count?.toString() || '0',
    comments_count: note?.comments_count?.toString() || '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('url', formData.url);
      formDataObj.append('publish_date', formData.publish_date);
      formDataObj.append('likes_count', formData.likes_count);
      formDataObj.append('collects_count', formData.collects_count);
      formDataObj.append('comments_count', formData.comments_count);

      let result;
      if (mode === 'create') {
        result = await createNote(appId, formDataObj);
      } else {
        result = await updateNote(note!.id, formDataObj);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Operation failed');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !confirm('Are you sure you want to delete this note?')) return;

    setIsLoading(true);
    try {
      const result = await deleteNote(note.id);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to delete note');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {mode === 'create' ? 'Add New Note' : 'Edit Note'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Xiaohongshu URL *
              </label>
              <input
                type="url"
                id="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="https://www.xiaohongshu.com/..."
              />
            </div>

            <div>
              <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700">
                Publish Date
              </label>
              <input
                type="date"
                id="publish_date"
                value={formData.publish_date}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="likes_count" className="block text-sm font-medium text-gray-700">
                  Likes
                </label>
                <input
                  type="number"
                  id="likes_count"
                  min="0"
                  value={formData.likes_count}
                  onChange={(e) => setFormData({ ...formData, likes_count: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="collects_count" className="block text-sm font-medium text-gray-700">
                  Collects
                </label>
                <input
                  type="number"
                  id="collects_count"
                  min="0"
                  value={formData.collects_count}
                  onChange={(e) => setFormData({ ...formData, collects_count: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="comments_count" className="block text-sm font-medium text-gray-700">
                  Comments
                </label>
                <input
                  type="number"
                  id="comments_count"
                  min="0"
                  value={formData.comments_count}
                  onChange={(e) => setFormData({ ...formData, comments_count: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-between items-center pt-4">
              <div>
                {mode === 'edit' && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}