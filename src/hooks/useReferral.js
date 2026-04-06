import { useState, useCallback, useEffect } from 'react';
import useUserStore from '../store/useUserStore';
import useAuthStore from '../store/useAuthStore';
import { fetchReferralData, fetchMyReferrals, redeemRewardPoints } from '../lib/supabaseService';
import { showToast } from '../components/ui/Toast';

export default function useReferral() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const userId = useAuthStore((s) => s.user?.id);
  const referralCode = useUserStore((s) => s.referralCode);
  const rewardPoints = useUserStore((s) => s.rewardPoints);
  const successfulReferrals = useUserStore((s) => s.successfulReferrals);
  const updateReferralData = useUserStore((s) => s.updateReferralData);

  const referralLink = referralCode
    ? `https://owngainz.vercel.app/auth?ref=${referralCode}`
    : null;

  const loadReferrals = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [refData, myRefs] = await Promise.all([
        fetchReferralData(userId),
        fetchMyReferrals(userId),
      ]);
      if (refData.data) updateReferralData(refData.data);
      if (myRefs.data) setReferrals(myRefs.data);
    } catch (e) {
      console.warn('Failed to load referral data:', e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, updateReferralData]);

  useEffect(() => { loadReferrals(); }, [loadReferrals]);

  const shareReferral = useCallback(async () => {
    if (!referralLink) return;
    const shareData = {
      title: 'Join OwnGainz',
      text: 'Get your personalized workout & diet plan! Use my referral link and get \u20b920 off PRO.',
      url: referralLink,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `${shareData.text}\n${referralLink}`
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  }, [referralLink]);

  const copyLink = useCallback(async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      showToast('Referral link copied!', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  }, [referralLink]);

  const redeemPoints = useCallback(async () => {
    if (rewardPoints < 500 || redeeming) return;
    setRedeeming(true);
    try {
      const { data, error } = await redeemRewardPoints();
      if (error) throw new Error(error.message || 'Redemption failed');

      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (!result.success) throw new Error(result.error || 'Redemption failed');

      updateReferralData({ rewardPoints: rewardPoints - 500 });
      useUserStore.getState().activatePro(result.subscription);
      showToast('1 Month PRO unlocked!', 'success', 5000);
    } catch (e) {
      showToast(e.message || 'Redemption failed', 'error');
    } finally {
      setRedeeming(false);
    }
  }, [rewardPoints, redeeming, updateReferralData]);

  const canRedeem = rewardPoints >= 500;
  const progressTo5 = Math.min(successfulReferrals, 5);

  return {
    referralCode, referralLink, rewardPoints, successfulReferrals,
    referrals, loading, redeeming,
    shareReferral, copyLink, redeemPoints, canRedeem, progressTo5,
    refresh: loadReferrals,
  };
}
