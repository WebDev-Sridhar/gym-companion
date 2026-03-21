import { Lock, Sparkles } from 'lucide-react';

/**
 * ProLock — overlay that blurs locked content and shows upgrade CTA.
 *
 * Usage:
 *   <ProLock>  (wraps content with blur overlay)
 *     <SomeProFeature />
 *   </ProLock>
 *
 *   <ProLock compact>  (inline/small variant)
 *     <SmallSection />
 *   </ProLock>
 */
export default function ProLock({ children, compact = false, message }) {
  if (compact) {
    return (
      <div className="relative">
        <div className="blur-[3px] pointer-events-none select-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-dark-bg/90 border border-accent/20 rounded-lg px-3 py-2">
            <Lock size={12} className="text-accent" />
            <span className="text-xs font-medium text-text-secondary">PRO</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="blur-[4px] pointer-events-none select-none opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
          <Lock size={18} className="text-accent" />
        </div>
        <p className="text-sm font-bold text-text-primary mb-1">
          {message || 'Unlock with Pro'}
        </p>
        <p className="text-xs text-text-muted max-w-[260px] leading-relaxed mb-3">
          Upgrade to access advanced workouts, diet plans & progress tracking
        </p>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
          <Sparkles size={12} /> Upgrade to Pro
        </span>
      </div>
    </div>
  );
}

/**
 * ProBadge — small "PRO" pill to label pro features.
 */
export function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
      <Sparkles size={8} /> Pro
    </span>
  );
}

/**
 * UpgradeBanner — larger CTA banner for Dashboard/Profile.
 */
export function UpgradeBanner({ className = '' }) {
  return (
    <div className={`border border-accent/15 rounded-xl p-5 sm:p-6 bg-gradient-to-br from-accent/[0.04] to-transparent ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary leading-snug">
            You've completed your basic plan
          </p>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Unlock advanced workouts, diet plans & progress tracking
          </p>
          <button className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/15 transition-colors">
            <Sparkles size={12} /> See Pro Features
          </button>
        </div>
      </div>
    </div>
  );
}
