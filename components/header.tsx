'use client';

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { SmoothScrollLink } from './smooth-scroll-link';

export function Header() {
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md py-4 z-50 border-b border-gray-100">
      <div className="mx-auto max-w-4xl px-6">
        <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-2xl px-6 py-3 animate-fadeIn shadow-sm">
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
              <a
                href="https://x.com/lantianlaoli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Follow on Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
            
            <div className="flex items-center space-x-6">
              <SmoothScrollLink 
                href="/#leaderboard" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                Leaderboard
              </SmoothScrollLink>
              <SmoothScrollLink 
                href="/#pricing" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                Pricing
              </SmoothScrollLink>
              <SmoothScrollLink 
                href="/#how-it-works" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                How it works
              </SmoothScrollLink>
              <SmoothScrollLink 
                href="/#questions" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                Questions
              </SmoothScrollLink>
              {user && (
                <Link href="/dashboard" className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1">
                  My Applications
                </Link>
              )}
              {user?.emailAddresses?.[0]?.emailAddress === 'lantianlaoli@gmail.com' && (
                <Link href="/admin" className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1">
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