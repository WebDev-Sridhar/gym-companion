import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Share2, Crown, Users, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import useReferral from '../hooks/useReferral';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function Rewards() {
  const {
    referralCode, referralLink, rewardPoints, successfulReferrals,
    referrals, loading, redeeming,
    shareReferral, copyLink, redeemPoints, canRedeem, progressTo5,
  } = useReferral();

  const [showReferrals, setShowReferrals] = useState(false);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Gift size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Rewards</h1>
            <p className="text-sm text-text-muted">Earn rewards by inviting friends</p>
          </div>
        </div>
      </motion.div>

      {/* Points Balance */}
      <motion.div {...fadeUp(0.05)} className="bg-dark-card border border-white/[0.06] rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Points Balance</p>
            <p className="text-4xl font-black text-text-primary">{rewardPoints}</p>
          </div>
          <button
            onClick={redeemPoints}
            disabled={!canRedeem || redeeming}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              canRedeem
                ? 'bg-accent text-dark-bg hover:brightness-110'
                : 'bg-white/[0.06] text-text-muted cursor-not-allowed'
            }`}
          >
            {redeeming ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Crown size={14} />
            )}
            {redeeming ? 'Redeeming...' : '500 pts = 1 Month PRO'}
          </button>
        </div>
        {!canRedeem && rewardPoints > 0 && (
          <p className="text-xs text-text-muted mt-3">
            {500 - rewardPoints} more points to redeem
          </p>
        )}
      </motion.div>

      {/* Referral Link */}
      <motion.div {...fadeUp(0.1)} className="bg-dark-card border border-white/[0.06] rounded-xl p-6 mb-4">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">Your Referral Link</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-text-secondary truncate font-mono">
            {referralLink || 'Loading...'}
          </div>
          <button
            onClick={copyLink}
            className="p-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors border border-white/[0.06]"
            title="Copy link"
          >
            <Copy size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={shareReferral}
            className="p-2.5 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors border border-accent/20"
            title="Share"
          >
            <Share2 size={16} className="text-accent" />
          </button>
        </div>
        <p className="text-xs text-accent/70 mt-2.5">Your friend gets ₹30 off their first PRO subscription</p>
      </motion.div>

      {/* Progress to 5 Referrals */}
      <motion.div {...fadeUp(0.15)} className="bg-dark-card border border-white/[0.06] rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-accent" />
            <p className="text-sm font-semibold text-text-primary">Invite 5 Friends for FREE PRO</p>
          </div>
          {progressTo5 >= 5 && (
            <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
              Unlocked!
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progressTo5 / 5) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-accent rounded-full"
          />
        </div>
        <p className="text-xs text-text-muted">
          {progressTo5 >= 5
            ? 'Congratulations! You earned a free month of PRO!'
            : `${progressTo5}/5 successful referrals — ${5 - progressTo5} more to go`
          }
        </p>
      </motion.div>

      {/* How It Works */}
      <motion.div {...fadeUp(0.2)} className="bg-dark-card border border-white/[0.06] rounded-xl p-6 mb-4">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-4">How It Works</p>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Share your link', desc: 'Send your referral link to friends' },
            { step: '2', title: 'Friend signs up', desc: 'You earn +10 points' },
            { step: '3', title: 'Friend subscribes', desc: 'You earn +100 points, they get ₹30 off' },
            { step: '4', title: 'Redeem points', desc: '500 points = 1 Month PRO' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent">{item.step}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{item.title}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* My Referrals */}
      {referrals.length > 0 && (
        <motion.div {...fadeUp(0.25)} className="bg-dark-card border border-white/[0.06] rounded-xl overflow-hidden mb-4">
          <button
            onClick={() => setShowReferrals(!showReferrals)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <p className="text-sm font-semibold text-text-primary">
              My Referrals ({referrals.length})
            </p>
            {showReferrals ? (
              <ChevronUp size={16} className="text-text-muted" />
            ) : (
              <ChevronDown size={16} className="text-text-muted" />
            )}
          </button>
          {showReferrals && (
            <div className="px-6 pb-6 space-y-2">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <span className="text-xs text-text-secondary font-mono">
                    {ref.referredUserId.slice(0, 8)}...
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ref.status === 'subscribed'
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'bg-white/[0.06] text-text-muted border border-white/[0.06]'
                  }`}>
                    {ref.status === 'subscribed' ? 'Subscribed' : 'Signed Up'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Stats Summary */}
      <motion.div {...fadeUp(0.3)} className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-dark-card border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-text-primary">{referrals.length}</p>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-1">Total Invited</p>
        </div>
        <div className="bg-dark-card border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-accent">{successfulReferrals}</p>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-1">Subscribed</p>
        </div>
        <div className="bg-dark-card border border-white/[0.06] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-text-primary">{rewardPoints}</p>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-1">Points</p>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
