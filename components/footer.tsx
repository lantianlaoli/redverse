
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Redverse</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Connecting global AI innovations with China&apos;s top lifestyle platform
          </p>
        </div>

        {/* Social Media and Badges */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Twitter Contact */}
          <a
            href="https://x.com/lantianlaoli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            title="Follow on Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-sm font-medium">Follow on Twitter</span>
          </a>

          {/* Product Hunt Badge */}
          <a 
            href="https://www.producthunt.com/products/redverse/reviews?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-redverse" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1088137&theme=light"
              alt="Redverse - let more inde dev have the chance to promot on china market | Product Hunt"
              width={250}
              height={54}
              className="max-w-full h-auto"
            />
          </a>
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