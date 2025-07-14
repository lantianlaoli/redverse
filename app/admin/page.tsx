'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AllApplicationsView } from '@/components/admin/all-applications-view';
import { TwitterUsersView } from '@/components/admin/twitter-users-view';

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
      case 'twitter':
        return <TwitterUsersView />;
      default:
        return <AllApplicationsView />;
    }
  };

  return (
    <AdminLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </AdminLayout>
  );
}