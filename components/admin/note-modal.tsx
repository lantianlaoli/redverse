'use client';

import { useState, useEffect } from 'react';
import { createNote, updateNote, deleteNote } from '@/lib/actions';
import { Note } from '@/lib/supabase';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appId: string;
  note?: Note | null;
  mode: 'create' | 'edit';
}

export function NoteModal({ isOpen, onClose, onSuccess, appId, note, mode }: NoteModalProps) {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    url: note?.url || '',
    likes_count: note?.likes_count?.toString() || '0',
    collects_count: note?.collects_count?.toString() || '0',
    comments_count: note?.comments_count?.toString() || '0',
    views_count: note?.views_count?.toString() || '0',
    shares_count: note?.shares_count?.toString() || '0',
  });
  const [originalData, setOriginalData] = useState({
    likes_count: 0,
    collects_count: 0,
    comments_count: 0,
    views_count: 0,
    shares_count: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 当模态框打开时，根据模式设置表单数据
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setFormData({
          url: '',
          likes_count: '0',
          collects_count: '0',
          comments_count: '0',
          views_count: '0',
          shares_count: '0',
        });
        setOriginalData({
          likes_count: 0,
          collects_count: 0,
          comments_count: 0,
          views_count: 0,
          shares_count: 0,
        });
      } else if (mode === 'edit' && note) {
        setFormData({
          url: note.url || '',
          likes_count: note.likes_count?.toString() || '0',
          collects_count: note.collects_count?.toString() || '0',
          comments_count: note.comments_count?.toString() || '0',
          views_count: note.views_count?.toString() || '0',
          shares_count: note.shares_count?.toString() || '0',
        });
        setOriginalData({
          likes_count: note.likes_count || 0,
          collects_count: note.collects_count || 0,
          comments_count: note.comments_count || 0,
          views_count: note.views_count || 0,
          shares_count: note.shares_count || 0,
        });
      }
    }
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setError('');
    }
  }, [isOpen, mode, note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('url', formData.url);
      formDataObj.append('likes_count', formData.likes_count);
      formDataObj.append('collects_count', formData.collects_count);
      formDataObj.append('comments_count', formData.comments_count);
      formDataObj.append('views_count', formData.views_count);
      formDataObj.append('shares_count', formData.shares_count);

      let result;
      if (mode === 'create') {
        result = await createNote(appId, formDataObj);
      } else {
        result = await updateNote(note!.id, formDataObj);
      }

      if (result.success) {
        // Show appropriate toast notification
        if (mode === 'create') {
          addToast('Note created successfully!', 'success');
        } else {
          // Calculate and show data changes for updates
          const newLikes = parseInt(formData.likes_count) || 0;
          const newCollects = parseInt(formData.collects_count) || 0;
          const newComments = parseInt(formData.comments_count) || 0;
          const newViews = parseInt(formData.views_count) || 0;
          const newShares = parseInt(formData.shares_count) || 0;

          const likesDiff = newLikes - originalData.likes_count;
          const collectsDiff = newCollects - originalData.collects_count;
          const commentsDiff = newComments - originalData.comments_count;
          const viewsDiff = newViews - originalData.views_count;
          const sharesDiff = newShares - originalData.shares_count;

          const changes = [];
          if (likesDiff !== 0) changes.push(`Likes ${likesDiff > 0 ? '+' : ''}${likesDiff}`);
          if (collectsDiff !== 0) changes.push(`Collects ${collectsDiff > 0 ? '+' : ''}${collectsDiff}`);
          if (commentsDiff !== 0) changes.push(`Comments ${commentsDiff > 0 ? '+' : ''}${commentsDiff}`);
          if (viewsDiff !== 0) changes.push(`Views ${viewsDiff > 0 ? '+' : ''}${viewsDiff}`);
          if (sharesDiff !== 0) changes.push(`Shares ${sharesDiff > 0 ? '+' : ''}${sharesDiff}`);

          if (changes.length > 0) {
            addToast(`Note updated: ${changes.join(', ')}`, 'success');
          } else {
            addToast('Note updated successfully!', 'success');
          }
        }
        
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
    if (!note) return;

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
    <div className="fixed inset-0 backdrop-blur-md overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border border-gray-200 w-96 shadow-xl rounded-xl bg-white/90 backdrop-blur-sm">
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
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="https://www.xiaohongshu.com/..."
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="views_count" className="block text-sm font-medium text-gray-700">
                  Views
                </label>
                <input
                  type="number"
                  id="views_count"
                  min="0"
                  value={formData.views_count}
                  onChange={(e) => setFormData({ ...formData, views_count: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="shares_count" className="block text-sm font-medium text-gray-700">
                  Shares
                </label>
                <input
                  type="number"
                  id="shares_count"
                  min="0"
                  value={formData.shares_count}
                  onChange={(e) => setFormData({ ...formData, shares_count: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
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
                    onClick={() => setShowDeleteConfirm(true)}
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
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}