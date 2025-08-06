'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function AdminLayout({ children, currentView, onViewChange }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <AdminSidebar currentView={currentView} onViewChange={onViewChange} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}