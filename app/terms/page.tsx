import { Metadata } from 'next';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

export const metadata: Metadata = {
  title: 'Terms of Service | Redverse',
  description: 'Terms of service for Redverse AI app marketing platform. Learn about our service terms, conditions, and policies for launching apps on Xiaohongshu.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Terms of Service' }]} />
        </div>

        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              By accessing and using Redverse (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Redverse provides AI-powered content creation and promotion services for launching applications on Xiaohongshu platform.
              Our service includes content generation, algorithm optimization, and promotional support for indie developers and SaaS tools.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Users agree to:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Provide accurate and complete information about their applications</li>
              <li>Ensure their applications comply with relevant laws and regulations</li>
              <li>Not submit applications that contain harmful, illegal, or inappropriate content</li>
              <li>Respect intellectual property rights of others</li>
              <li>Use the service in accordance with Xiaohongshu&apos;s terms of service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Limitations</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              While we strive to provide quality promotional content, we cannot guarantee specific results or engagement metrics.
              The success of promotional campaigns depends on various factors including content quality, market conditions, and platform algorithms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-900 mb-4">5. Payment Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our service operates on a subscription basis. Payment is required in advance for the selected plan.
              Refunds may be provided at our discretion based on the specific circumstances and usage of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Content created through our service is provided to users for their promotional use.
              Users retain ownership of their application information and materials provided to us.
              Redverse retains ownership of our proprietary algorithms and service methodology.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect and process user data in accordance with our Privacy Policy.
              We implement appropriate security measures to protect user information and application data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We strive to maintain service availability but cannot guarantee uninterrupted access.
              Scheduled maintenance and updates may temporarily affect service availability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Either party may terminate the service agreement with appropriate notice.
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Redverse shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our service.
              Our total liability is limited to the amount paid for the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We reserve the right to modify these terms at any time. Users will be notified of significant changes.
              Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For questions about these terms, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'legal@redverse.com'}
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}