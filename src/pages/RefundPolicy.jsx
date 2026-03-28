import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto w-full py-12 sm:py-16 px-5 sm:px-8 flex-1"
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Refund Policy</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">1. Digital Product</h2>
            <p className="text-text-secondary leading-relaxed">
              GymThozhan PRO is a digital subscription service. Due to the nature of digital products, all sales are generally final. Once your subscription is activated and you have access to PRO features, a refund is not automatically provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">2. Exceptions</h2>
            <p className="text-text-secondary leading-relaxed">
              We understand that issues may arise. Refunds may be considered in the following cases:
            </p>
            <ul className="mt-3 space-y-2 text-text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">&#8226;</span>
                <span>Duplicate or accidental payment — if you were charged more than once for the same subscription period.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">&#8226;</span>
                <span>Technical issue — if a payment was processed but PRO features were not activated due to a system error on our end.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">&#8226;</span>
                <span>Unauthorized transaction — if a payment was made without your consent.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">3. Cancellation</h2>
            <p className="text-text-secondary leading-relaxed">
              You can cancel your PRO subscription at any time through the Profile page. Upon cancellation, you will continue to have access to PRO features until the end of your current billing period. No further charges will be made after cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">4. How to Request a Refund</h2>
            <p className="text-text-secondary leading-relaxed">
              To request a refund under the exceptions listed above, contact us at{' '}
              <a href="mailto:support@gymthozhan.com" className="text-accent hover:underline underline-offset-2">
                support@gymthozhan.com
              </a>{' '}
              with your account email and a description of the issue. We aim to respond within 3-5 business days.
            </p>
          </section>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
