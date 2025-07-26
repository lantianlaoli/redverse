'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Users, FileText, ChevronRight, Home, CreditCard } from 'lucide-react';

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
      id: 'founder',
      icon: Users,
      label: 'Founder Users',
      description: 'Group by users'
    },
    {
      id: 'subscriptions',
      icon: CreditCard,
      label: 'Subscription Management',
      description: 'Manage pricing plans'
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Admin"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.firstName?.[0] || 'A'}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName || 'Admin'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              Admin Dashboard
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Available for work</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
              currentView === item.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700 space-y-4">
        {/* Back to Home Button */}
        <Link 
          href="/"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Website</span>
        </Link>
        
        <div className="text-xs text-gray-400">
          <p className="font-medium mb-2">Online</p>
          <div className="flex space-x-3">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
               className="text-gray-400 hover:text-white transition-colors">
              TW
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-white transition-colors">
              GH
            </a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-white transition-colors">
              DB
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}