import { Metadata } from 'next';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

export const metadata: Metadata = {
  title: 'Privacy Policy | Redverse',
  description: 'Privacy policy for Redverse AI app marketing platform. Learn how we collect, use, and protect your personal data and application information.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
        </div>

        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Redverse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered app marketing service for Xiaohongshu platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">We may collect the following personal information:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Name and contact information</li>
              <li>Email address</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Account credentials and authentication data</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">Application Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Information about your applications:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Application URLs and descriptions</li>
              <li>Product images and promotional materials</li>
              <li>App functionality and features</li>
              <li>Target audience and market information</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">Usage Data</h3>
            <p className="text-gray-600 leading-relaxed mb-4">We automatically collect:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Log files and usage patterns</li>
              <li>Device information and IP addresses</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and time spent on our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We use collected information to:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Provide and maintain our promotional services</li>
              <li>Create AI-generated content for Xiaohongshu promotion</li>
              <li>Process payments and manage subscriptions</li>
              <li>Communicate with you about our services</li>
              <li>Improve our algorithms and service quality</li>
              <li>Comply with legal obligations</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We may share your information with:</p>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">Service Providers</h3>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Payment processors for subscription management</li>
              <li>Cloud hosting providers for data storage</li>
              <li>Analytics providers for service improvement</li>
              <li>AI and content generation services</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">Legal Requirements</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may disclose information when required by law, regulation, or legal process, or to protect our rights and the safety of our users.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">Xiaohongshu Platform</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Application information and promotional content are shared with Xiaohongshu platform as part of our promotional services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication systems</li>
              <li>Monitoring for unauthorized access attempts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. 
              Application data is typically retained for the duration of your subscription and may be kept for a reasonable period afterward for backup and legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Access your personal information we hold</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar technologies to improve user experience, analyze usage patterns, and provide personalized content. 
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your information may be processed in countries other than your residence. We ensure appropriate safeguards are in place to protect your data during international transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our service is not directed to individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Updates to Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may update this Privacy Policy periodically. We will notify you of material changes through email or prominent notice on our service.
              Your continued use of our service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-gray-600 mb-2">
              Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'privacy@redverse.com'}
            </p>
            <p className="text-gray-600">
              We will respond to your inquiry within a reasonable timeframe.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}