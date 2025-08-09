'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { FileText, Home, CreditCard, Bot, Mail, BookOpen } from 'lucide-react';

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const { user } = useUser();

  const navigationItems = [
    {
      id: 'applications',
      icon: FileText,
      label: 'All Applications',
      description: 'Manage all submissions'
    },
    {
      id: 'subscriptions',
      icon: CreditCard,
      label: 'Subscription Management',
      description: 'Manage pricing plans'
    },
    {
      id: 'crawler',
      icon: Bot,
      label: 'Xiaohongshu Crawler',
      description: 'Manage data crawling'
    },
    {
      id: 'email-testing',
      icon: Mail,
      label: 'Email Testing',
      description: 'Test email templates'
    },
    {
      id: 'articles',
      icon: BookOpen,
      label: 'Articles Management',
      description: 'Manage guide articles'
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-3 mb-4 hover:bg-gray-50 p-2 -m-2 rounded transition-colors">
          <Image 
            src="/logo.png" 
            alt="Redverse logo" 
            width={24} 
            height={24}
            className="rounded"
            style={{ width: '24px', height: '24px' }}
          />
          <div>
            <h1 className="text-base font-medium text-gray-900">Redverse</h1>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </Link>
        
        {/* User Profile Section */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Admin"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {user?.firstName?.[0] || 'A'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 truncate">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-left transition-colors text-sm ${
              currentView === item.id
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-4 h-4 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{item.label}</p>
            </div>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-100">
        <Link 
          href="/"
          className="flex items-center space-x-3 px-3 py-2 rounded text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm"
        >
          <Home className="w-4 h-4 text-gray-400" />
          <span className="font-medium">Back to Website</span>
        </Link>
      </div>
    </div>
  );
}