'use client';

import { useState, useEffect } from 'react';
import { getAllApplications, getNotesForApp, deleteApplication, deleteNote } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import { NoteModal } from './note-modal';
import { AppEditModal } from './app-edit-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Calendar, User, ExternalLink, Plus, FileText, Eye, Trash2, Edit, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export function AllApplicationsView() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [appNotes, setAppNotes] = useState<{ [appId: string]: Note[] }>({});
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    appId: string;
    note?: Note | null;
  }>({
    isOpen: false,
    mode: 'create',
    appId: '',
    note: null,
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({
    isOpen: false,
    application: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'application' | 'note';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'application',
    id: '',
    name: '',
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await getAllApplications();
      
      if (result.success && result.applications) {
        setApplications(result.applications);
      } else {
        setError(result.error || 'Failed to fetch applications');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const fetchNotesForApp = async (appId: string) => {
    try {
      const result = await getNotesForApp(appId);
      if (result.success && result.notes) {
        setAppNotes(prev => ({ ...prev, [appId]: result.notes! }));
      }
    } catch {
      setError('Failed to fetch notes');
    }
  };

  const toggleAppExpansion = async (appId: string) => {
    if (expandedApp === appId) {
      setExpandedApp(null);
    } else {
      setExpandedApp(appId);
      if (!appNotes[appId]) {
        await fetchNotesForApp(appId);
      }
    }
  };

  // Helper function to get missing fields
  const getMissingFields = (app: Application) => {
    const missing = [];
    if (!app.twitter_id) missing.push('Twitter ID');
    if (!app.image) missing.push('Image');
    if (!app.explain) missing.push('Description');
    return missing;
  };

  // Helper function to get completion percentage
  const getCompletionPercentage = (app: Application) => {
    const totalFields = 3; // twitter_id, image, explain
    const missingCount = getMissingFields(app).length;
    return Math.round(((totalFields - missingCount) / totalFields) * 100);
  };

  const openNoteModal = (mode: 'create' | 'edit', appId: string, note?: Note) => {
    setNoteModal({
      isOpen: true,
      mode,
      appId,
      note,
    });
  };

  const openEditModal = (application: Application) => {
    setEditModal({
      isOpen: true,
      application,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      application: null,
    });
  };

  const closeNoteModal = () => {
    setNoteModal({
      isOpen: false,
      mode: 'create',
      appId: '',
      note: null,
    });
  };

  const handleNoteSuccess = async () => {
    if (expandedApp) {
      await fetchNotesForApp(expandedApp);
    }
  };

  const handleDeleteApplication = (appId: string, appName: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'application',
      id: appId,
      name: appName || 'this application',
    });
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'application') {
        const result = await deleteApplication(deleteConfirm.id);
        
        if (result.success) {
          // Refresh the applications list
          await fetchApplications();
          // Close expanded view if it was the deleted app
          if (expandedApp === deleteConfirm.id) {
            setExpandedApp(null);
          }
        } else {
          setError(result.error || 'Failed to delete application');
        }
      } else {
        const result = await deleteNote(deleteConfirm.id);
        
        if (result.success) {
          // Refresh the notes for the current expanded app
          if (expandedApp) {
            await fetchNotesForApp(expandedApp);
          }
        } else {
          setError(result.error || 'Failed to delete note');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'note',
      id: noteId,
      name: 'this note',
    });
  };


  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchApplications}
          className="text-sm text-red-700 hover:text-red-900 underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Applications</h1>
          <p className="text-gray-600">Manage AI application submissions and notes</p>
        </div>
        
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Applications will appear here once users start submitting their AI projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Applications</h1>
        <p className="text-gray-600">Manage AI application submissions and notes</p>
        <div className="mt-4 text-sm text-gray-500">
          Total applications: {applications.length}
        </div>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-6">
              <div className="flex items-start space-x-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {app.image ? (
                    <Image
                      src={app.image}
                      alt={app.name || 'Application'}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                </div>
                
                {/* App Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {app.name || 'Untitled Application'}
                    </h3>
                    <a 
                      href={app.url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-500">
                    {app.twitter_id && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>@{app.twitter_id}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Missing Fields Warning */}
                  {getMissingFields(app).length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-amber-700 font-medium">
                            Missing: {getMissingFields(app).join(', ')}
                          </p>
                          <div className="mt-1 bg-amber-200 rounded-full h-1.5">
                            <div 
                              className="bg-amber-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${getCompletionPercentage(app)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Description Preview */}
                  {app.explain && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600 line-clamp-2">{app.explain}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Count */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {appNotes[app.id]?.length || 0} notes
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(app)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit application"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => toggleAppExpansion(app.id)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {expandedApp === app.id ? 'Hide' : 'View'}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteApplication(app.id, app.name || 'Untitled Application')}
                    className="inline-flex items-center px-2 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Notes Section */}
            {expandedApp === app.id && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Associated Notes</h4>
                  <button 
                    onClick={() => openNoteModal('create', app.id)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {appNotes[app.id]?.length > 0 ? appNotes[app.id].map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <a 
                          href={note.url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          Xiaohongshu Post <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openNoteModal('edit', app.id, note)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {note.publish_date ? new Date(note.publish_date).toLocaleDateString() : 'No date'}
                      </p>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>❤️ {note.likes_count || 0}</span>
                        <span>📁 {note.collects_count || 0}</span>
                        <span>💬 {note.comments_count || 0}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 text-center py-4">No notes yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <NoteModal
        isOpen={noteModal.isOpen}
        onClose={closeNoteModal}
        onSuccess={handleNoteSuccess}
        appId={noteModal.appId}
        note={noteModal.note}
        mode={noteModal.mode}
      />

      {editModal.application && (
        <AppEditModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          onSuccess={() => {
            fetchApplications();
            closeEditModal();
          }}
          application={editModal.application}
        />
      )}
      
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteConfirm.type === 'application' ? 'Delete Application' : 'Delete Note'}
        message={
          deleteConfirm.type === 'application'
            ? `Are you sure you want to delete "${deleteConfirm.name}"? This will also delete all associated notes. This action cannot be undone.`
            : `Are you sure you want to delete ${deleteConfirm.name}? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}