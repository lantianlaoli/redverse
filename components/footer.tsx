import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Left side - Brand info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Redverse</h3>
            <p className="text-gray-400 max-w-md">
              Connecting global AI innovations with China&apos;s top lifestyle platform
            </p>
          </div>

          {/* Right side - Social links */}
          <div className="flex flex-col space-y-3">
            <a
              href="https://x.com/lantianlaoli"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Twitter
            </a>
            <Link
              href="/#leaderboard"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/submit"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Submit App
            </Link>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Redverse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}