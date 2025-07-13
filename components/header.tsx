'use client';

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  const { user } = useUser();

  return (
    <header className="bg-white py-4">
      <div className="mx-auto max-w-4xl px-6">
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <Image 
                  src="/logo.png" 
                  alt="Redverse" 
                  width={32} 
                  height={32}
                  style={{
                    width: '32px',
                    height: '32px'
                  }}
                  priority
                />
                <span className="text-lg font-semibold text-gray-900">Redverse</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/#leaderboard" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                Leaderboard
              </Link>
              {user && (
                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                  My Applications
                </Link>
              )}
              {user?.emailAddresses?.[0]?.emailAddress === 'lantianlaoli@gmail.com' && (
                <Link href="/admin" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
                  Admin
                </Link>
              )}
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer">
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
      </div>
    </header>
  );
}