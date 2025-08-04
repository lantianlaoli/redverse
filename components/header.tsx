'use client';

import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { SmoothScrollLink } from './smooth-scroll-link';
import { useState } from 'react';

export function Header() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 py-2 sm:py-4 z-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-2xl px-4 sm:px-6 py-2 sm:py-3 animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <Image 
                  src="/logo.png" 
                  alt="Redverse logo - AI app marketing platform for China market" 
                  width={48} 
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
                  style={{
                    width: '40px',
                    height: '40px'
                  }}
                  priority
                />
                <span className="text-base sm:text-lg brand-text">Redverse</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <SmoothScrollLink 
                href="/#how-it-works" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                How it works
              </SmoothScrollLink>
              <Link 
                href="/leaderboard" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                Leaderboard
              </Link>
              <Link 
                href="/guides" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                Guides
              </Link>
              <SmoothScrollLink 
                href="/#pricing" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                Pricing
              </SmoothScrollLink>
              <SmoothScrollLink 
                href="/#questions" 
                className="nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
              >
                Questions
              </SmoothScrollLink>
              {user && (
                <Link href="/dashboard" className="dashboard-highlight-btn">
                  Dashboard
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

            {/* Mobile Menu Button & Auth */}
            <div className="lg:hidden flex items-center space-x-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
              
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 mobile-menu-enter">
              <div className="flex flex-col space-y-3">
                <SmoothScrollLink 
                  href="/#how-it-works" 
                  className="mobile-menu-item nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
                  onClick={closeMenu}
                >
                  How it works
                </SmoothScrollLink>
                <Link 
                  href="/leaderboard" 
                  className="mobile-menu-item nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
                  onClick={closeMenu}
                >
                  Leaderboard
                </Link>
                <Link 
                  href="/guides" 
                  className="mobile-menu-item nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
                  onClick={closeMenu}
                >
                  Guides
                </Link>
                <SmoothScrollLink 
                  href="/#pricing" 
                  className="mobile-menu-item nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
                  onClick={closeMenu}
                >
                  Pricing
                </SmoothScrollLink>
                <SmoothScrollLink 
                  href="/#questions" 
                  className="mobile-menu-item nav-link text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer pb-1"
                  onClick={closeMenu}
                >
                  Questions
                </SmoothScrollLink>
                {user && (
                  <Link 
                    href="/dashboard" 
                    className="mobile-menu-item dashboard-highlight-btn-mobile"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}