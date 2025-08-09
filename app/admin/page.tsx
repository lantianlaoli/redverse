'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AllApplicationsView } from '@/components/admin/all-applications-view';
import { SubscriptionsView } from '@/components/admin/subscriptions-view';
import { CrawlerManagement } from '@/components/admin/crawler-management';
import { EmailTestingView } from '@/components/admin/email-testing-view';
import { ArticlesManagement } from '@/components/admin/articles-management';
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
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'crawler':
        return <CrawlerManagement />;
      case 'email-testing':
        return <EmailTestingView />;
      case 'articles':
        return <ArticlesManagement />;
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