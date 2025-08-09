'use client';

import { useState, useEffect } from 'react';
import { getAllApplications, deleteApplication } from '@/lib/actions';
import { Application } from '@/lib/supabase';
import { NotesManagementModal } from './notes-management-modal';
import { AppEditModal } from './app-edit-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ExternalLink, FileText, Trash2, Edit, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export function AllApplicationsView() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesModal, setNotesModal] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({
    isOpen: false,
    application: null,
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
    id: string;
    name: string;
  }>({
    isOpen: false,
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



  // Helper function to get missing fields
  const getMissingFields = (app: Application) => {
    const missing = [];
    if (!app.founder_url) missing.push('Founder URL');
    if (!app.image) missing.push('Image');
    if (!app.explain) missing.push('Description');
    return missing;
  };

  // Helper function to get completion percentage
  const getCompletionPercentage = (app: Application) => {
    const totalFields = 3; // founder_url, image, explain
    const missingCount = getMissingFields(app).length;
    return Math.round(((totalFields - missingCount) / totalFields) * 100);
  };

  const openNotesModal = (application: Application) => {
    setNotesModal({
      isOpen: true,
      application,
    });
  };

  const closeNotesModal = () => {
    setNotesModal({
      isOpen: false,
      application: null,
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


  const handleDeleteApplication = (appId: string, appName: string) => {
    setDeleteConfirm({
      isOpen: true,
      id: appId,
      name: appName || 'this application',
    });
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteApplication(deleteConfirm.id);
      
      if (result.success) {
        // Refresh the applications list
        await fetchApplications();
      } else {
        setError(result.error || 'Failed to delete application');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', name: '' });
    }
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
          <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group">
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
                      className="text-gray-600 hover:text-black flex-shrink-0 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
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
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{app.explain}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Manage notes
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(app)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit application"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => openNotesModal(app)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
                    title="Manage notes"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Notes
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

          </div>
        ))}
      </div>

      <NotesManagementModal
        isOpen={notesModal.isOpen}
        onClose={closeNotesModal}
        application={notesModal.application}
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
        title="Delete Application"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This will also delete all associated notes. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}