export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Main content - Left/Right layout */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left side - Brand and Email */}
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-bold mb-4">Redverse</h3>
            <p className="text-gray-400 text-sm mb-4">
              {process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@redverse.com'}
            </p>
          </div>

          {/* Right side - Social Links */}
          <div className="text-center lg:text-right">
            <div className="flex flex-col space-y-3">
              <a
                href="https://x.com/lantianlaoli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-gray-400 text-xs text-center lg:text-left">
              © 2025 Redverse. All rights reserved.
            </p>
            
            {/* Legal Links */}
            <div className="flex items-center justify-center lg:justify-end space-x-6">
              <a
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors text-xs"
              >
                Terms
              </a>
              <a
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors text-xs"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}