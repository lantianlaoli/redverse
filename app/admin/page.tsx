'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { useAdminAuth } from '@/lib/admin-auth';
import { getAllApplications, updateApplicationStatus, getNotesForApp } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import { NoteModal } from '@/components/admin/note-modal';

export default function AdminDashboard() {
  const { checkAuth, logout } = useAdminAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/admin/login');
      return;
    }
    fetchApplications();
  }, [checkAuth, router]);

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

  const handleStatusUpdate = async (appId: string, status: string) => {
    try {
      const result = await updateApplicationStatus(appId, status);
      
      if (result.success) {
        await fetchApplications(); // Refresh the list
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch {
      setError('Something went wrong. Please try again.');
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

  const openNoteModal = (mode: 'create' | 'edit', appId: string, note?: Note) => {
    setNoteModal({
      isOpen: true,
      mode,
      appId,
      note,
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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      case 'published':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Published</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending Review</span>;
    }
  };

  if (!checkAuth()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Review and manage AI application submissions</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
          >
            Logout
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchApplications}
              className="text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {applications.map((app) => (
                <li key={app.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {app.name || 'Untitled'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {app.url}
                        </p>
                        {app.twitter_id && (
                          <p className="text-sm text-gray-500">
                            Twitter: @{app.twitter_id}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          User ID: {app.user_id}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(app.status)}
                        <div className="text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString('en-US')}
                        </div>
                        <div className="flex space-x-2">
                          {app.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'approved')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'rejected')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </button>
                          )}
                          {app.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'published')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            onClick={() => toggleAppExpansion(app.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            {expandedApp === app.id ? 'Hide Notes' : 'Manage Notes'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedApp === app.id && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Notes for this application:</h4>
                        <div className="space-y-2">
                          {appNotes[app.id]?.map((note) => (
                            <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{note.url}</p>
                                  <p className="text-xs text-gray-500">
                                    Published: {note.publish_date ? new Date(note.publish_date).toLocaleDateString() : 'Not set'}
                                  </p>
                                  <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                                    <span>👍 {note.likes_count || 0}</span>
                                    <span>📁 {note.collects_count || 0}</span>
                                    <span>💬 {note.comments_count || 0}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => openNoteModal('edit', app.id, note)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          )) || <p className="text-sm text-gray-500">No notes yet.</p>}
                          
                          <button 
                            onClick={() => openNoteModal('create', app.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-black hover:bg-gray-800"
                          >
                            Add New Note
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <NoteModal
          isOpen={noteModal.isOpen}
          onClose={closeNoteModal}
          onSuccess={handleNoteSuccess}
          appId={noteModal.appId}
          note={noteModal.note}
          mode={noteModal.mode}
        />
      </main>
    </div>
  );
}