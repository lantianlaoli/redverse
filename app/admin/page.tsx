'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AllApplicationsView } from '@/components/admin/all-applications-view';
import { FounderUsersView } from '@/components/admin/founder-users-view';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [currentView, setCurrentView] = useState('applications');

  useEffect(() => {
    if (isLoaded) {
      if (!user || user.emailAddresses?.[0]?.emailAddress !== 'lantianlaoli@gmail.com') {
        router.push('/');
        return;
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user || user.emailAddresses?.[0]?.emailAddress !== 'lantianlaoli@gmail.com') {
    return null;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'applications':
        return <AllApplicationsView />;
      case 'founder':
        return <FounderUsersView />;
      default:
        return <AllApplicationsView />;
    }
  };

  return (
    <ToastProvider>
      <AdminLayout currentView={currentView} onViewChange={setCurrentView}>
        {renderCurrentView()}
      </AdminLayout>
    </ToastProvider>
  );
}