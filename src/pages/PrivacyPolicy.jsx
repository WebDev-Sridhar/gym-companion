import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto w-full py-12 sm:py-16 px-5 sm:px-8 flex-1"
      >
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">1. Information We Collect</h2>
            <p className="text-text-secondary leading-relaxed">
              When you sign in with Google, we collect your name and email address to create your account. We also collect workout activity data, dietary preferences, body metrics (height, weight, age), and fitness goals that you provide during onboarding and app usage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">2. How We Use Your Data</h2>
            <p className="text-text-secondary leading-relaxed">
              Your data is used to generate personalized workout plans, diet plans, and track your fitness progress. We use Supabase for secure data storage and authentication. Your workout logs, meal logs, and progress data are stored to provide a seamless experience across devices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">3. Payments</h2>
            <p className="text-text-secondary leading-relaxed">
              Payment processing for PRO subscriptions is handled by Razorpay. We do not store your payment card details. Razorpay processes and stores payment information in accordance with their own privacy policy and PCI-DSS compliance standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">4. Data Sharing</h2>
            <p className="text-text-secondary leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. Your data is only shared with service providers (Supabase for storage, Google for authentication, Razorpay for payments) necessary to operate the application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">5. Data Security</h2>
            <p className="text-text-secondary leading-relaxed">
              We implement industry-standard security measures including encrypted connections (HTTPS), row-level security policies on our database, and secure authentication via Google OAuth. However, no method of electronic transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">6. Your Rights</h2>
            <p className="text-text-secondary leading-relaxed">
              You can request deletion of all your data at any time through the Profile page using the "Reset All Data" option, or by contacting us at owngains.support@gmail.com. Upon request, we will permanently remove all your personal data from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">7. Changes to This Policy</h2>
            <p className="text-text-secondary leading-relaxed">
              We may update this privacy policy from time to time. We will notify users of any significant changes through the app. Continued use of OwnGains after changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
