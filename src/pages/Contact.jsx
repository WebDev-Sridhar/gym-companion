import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function Contact() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Contact Us</h1>
        <p className="text-text-muted text-sm mb-10">We're here to help</p>

        <div className="border border-white/[0.06] rounded-2xl p-8 sm:p-10 bg-white/[0.02]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Mail size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Email Support</h2>
              <p className="text-text-muted text-sm">We typically respond within 24-48 hours</p>
            </div>
          </div>

          <a
            href="mailto:support@gymthozhan.com"
            className="inline-flex items-center gap-2 text-accent hover:underline underline-offset-4 text-lg font-medium transition-colors"
          >
            support@gymthozhan.com
          </a>

          <div className="mt-8 pt-8 border-t border-white/[0.06]">
            <h3 className="text-sm font-semibold text-text-primary mb-3">What can we help with?</h3>
            <ul className="space-y-2 text-text-secondary text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#8226;</span>
                <span>Account issues or data deletion requests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#8226;</span>
                <span>Payment or subscription questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#8226;</span>
                <span>Bug reports or technical problems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#8226;</span>
                <span>Feature requests or general feedback</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
