import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function Disclaimer() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Disclaimer</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8">
          <div className="border border-neon-green/20 bg-neon-green/[0.03] rounded-xl p-5">
            <p className="text-text-secondary leading-relaxed font-medium">
              Please read this disclaimer carefully before using GymThozhan. By using the application, you acknowledge and agree to the following.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">1. Not Medical Advice</h2>
            <p className="text-text-secondary leading-relaxed">
              GymThozhan provides fitness and nutrition information for educational and general wellness purposes only. The workout plans, diet plans, and any other content provided through the application are not intended as medical advice, diagnosis, or treatment. This app is not a substitute for professional medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">2. Use at Your Own Risk</h2>
            <p className="text-text-secondary leading-relaxed">
              All exercises, diet plans, and fitness recommendations are performed at your own risk. GymThozhan, its creators, and contributors are not responsible for any injuries, health complications, or adverse effects that may result from following the programs, exercises, or nutritional guidance provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">3. Consult a Doctor</h2>
            <p className="text-text-secondary leading-relaxed">
              We strongly recommend consulting with a qualified healthcare professional or physician before starting any new exercise program, making dietary changes, or if you have any pre-existing medical conditions, injuries, or health concerns. This is especially important if you are pregnant, nursing, have cardiovascular conditions, or are taking medication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">4. No Guaranteed Results</h2>
            <p className="text-text-secondary leading-relaxed">
              Individual results vary based on numerous factors including genetics, effort, consistency, diet, and overall health. GymThozhan does not guarantee any specific results from using the application. Progress depends on your individual commitment and circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3">5. Third-Party Services</h2>
            <p className="text-text-secondary leading-relaxed">
              GymThozhan integrates with third-party services (Google, Razorpay, Supabase) and is not responsible for the practices, content, or availability of these services. Use of third-party services is governed by their respective terms and policies.
            </p>
          </section>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
