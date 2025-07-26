'use client';

import { useState, useEffect } from 'react';
import { getNotesForApp, deleteNote } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import { NoteModal } from './note-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import { Plus, ExternalLink, Edit, Trash2, X, Heart, Folder, MessageCircle, FileText, Share2 } from 'lucide-react';

interface NotesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

export function NotesManagementModal({ isOpen, onClose, application }: NotesManagementModalProps) {
  const { addToast } = useToast();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Note modal state
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    note?: Note | null;
  }>({
    isOpen: false,
    mode: 'create',
    note: null,
  });
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    noteId: string;
  }>({
    isOpen: false,
    noteId: '',
  });

  const fetchNotes = async () => {
    if (!application) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await getNotesForApp(application.id);
      if (result.success && result.notes) {
        setNotes(result.notes);
      } else {
        setError(result.error || 'Failed to fetch notes');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notes when modal opens
  useEffect(() => {
    if (isOpen && application) {
      fetchNotes();
    }
    if (!isOpen) {
      setError('');
      setNotes([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, application]);

  const openNoteModal = (mode: 'create' | 'edit', note?: Note) => {
    setNoteModal({
      isOpen: true,
      mode,
      note: mode === 'edit' ? note : null,
    });
  };

  const closeNoteModal = () => {
    setNoteModal({
      isOpen: false,
      mode: 'create',
      note: null,
    });
  };

  const handleNoteSuccess = () => {
    fetchNotes(); // Refresh the notes list
    closeNoteModal();
  };

  const handleDeleteNote = (noteId: string) => {
    setDeleteConfirm({
      isOpen: true,
      noteId,
    });
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteNote(deleteConfirm.noteId);
      
      if (result.success) {
        addToast('Note deleted successfully', 'success');
        fetchNotes(); // Refresh the notes list
      } else {
        setError(result.error || 'Failed to delete note');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setDeleteConfirm({ isOpen: false, noteId: '' });
    }
  };

  if (!isOpen || !application) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 backdrop-blur-md overflow-y-auto h-full w-full z-50">
        <div className="relative top-8 mx-auto p-6 border border-gray-200 max-w-4xl shadow-xl rounded-xl bg-white/90 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {application.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={application.image}
                    alt={application.name || 'Application'}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {application.name || 'Untitled Application'}
                </h3>
                <p className="text-sm text-gray-500">Manage associated notes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Add Note Button */}
          <div className="mb-6">
            <button 
              onClick={() => openNoteModal('create')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Note
            </button>
          </div>

          {/* Notes Content */}
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-500">Loading notes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchNotes}
                  className="text-sm text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h4>
                <p className="text-gray-500 mb-6">Start by adding your first note for this application.</p>
                <button 
                  onClick={() => openNoteModal('create')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Note
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-colors">
                    {/* Note Header */}
                    <div className="flex justify-between items-start mb-3">
                      <a 
                        href={note.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-base font-medium text-black hover:text-gray-700 flex items-center group"
                      >
                        Xiaohongshu Post 
                        <ExternalLink className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openNoteModal('edit', note)}
                          className="text-gray-600 hover:text-blue-600 p-1 rounded transition-colors"
                          title="Edit note"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-gray-600 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{note.likes_count || 0} Likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-yellow-500" />
                        <span>{note.collects_count || 0} Collects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span>{note.comments_count || 0} Comments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-green-500 text-center text-xs font-bold">V</span>
                        <span>{note.views_count || 0} Views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-purple-500" />
                        <span>{note.shares_count || 0} Shares</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {application && (
        <NoteModal
          isOpen={noteModal.isOpen}
          onClose={closeNoteModal}
          onSuccess={handleNoteSuccess}
          appId={application.id}
          note={noteModal.note}
          mode={noteModal.mode}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, noteId: '' })}
        onConfirm={confirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}