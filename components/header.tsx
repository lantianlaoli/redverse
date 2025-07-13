'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Redverse" 
                width={120} 
                height={32}
                style={{
                  width: 'auto',
                  height: '32px'
                }}
                priority
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <SignedIn>
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                My Applications
              </Link>
            </SignedIn>
            <Link href={isAdmin ? "/admin" : "/admin/login"} className="text-sm font-medium text-red-600 hover:text-red-800">
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}