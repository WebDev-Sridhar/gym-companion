import { useState } from 'react';
import { Play, Lock, X, Dumbbell, Zap, Target } from 'lucide-react';
import useUserStore from '../../store/useUserStore';
import { showUpgradeModal } from '../ui/PaymentModal';

const difficultyColors = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const equipmentIcons = {
  'Barbell & Dumbbell': Dumbbell,
  'Machine & Cable': Zap,
  'Bodyweight': Target,
};

export default function WorkoutCard({ workout }) {
  const [showDetail, setShowDetail] = useState(false);
  const plan = useUserStore((s) => s.plan);
  const isPro = plan === 'pro';

  const handleView = () => {
    if (!isPro) {
      showUpgradeModal();
      return;
    }
    setShowDetail(true);
  };

  const EquipIcon = equipmentIcons[workout.equipment] || Dumbbell;

  return (
    <>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-black">
          <img
            src={`https://img.youtube.com/vi/${workout.videoId}/mqdefault.jpg`}
            alt={workout.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Difficulty badge */}
          <span
            className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[workout.difficulty]}`}
          >
            {workout.difficulty}
          </span>

          {/* Equipment badge */}
          <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white/70 border border-white/10">
            <EquipIcon size={10} />
            {workout.equipment}
          </span>

          {/* Play overlay for PRO */}
          {isPro && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="w-10 h-10 rounded-full bg-[#09cadb]/90 flex items-center justify-center">
                <Play size={18} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          )}

          {/* Lock overlay for free users */}
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Lock size={16} className="text-white/70" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-white/90 line-clamp-1 mb-1">
            {workout.name}
          </h3>
          <p className="text-xs text-[#09cadb] font-medium mb-3">
            {workout.targetMuscle}
          </p>
          <button
            onClick={handleView}
            className="w-full text-xs font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]"
          >
            {isPro ? (
              <>
                <Play size={12} /> View Details
              </>
            ) : (
              <>
                <Lock size={12} /> Unlock with Pro
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && isPro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-lg font-bold text-white">{workout.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#09cadb] font-medium">
                    {workout.targetMuscle}
                  </span>
                  <span className="text-white/20">·</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[workout.difficulty]}`}
                  >
                    {workout.difficulty}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/50">{workout.equipment}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Video */}
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${workout.videoId}`}
                title={workout.name}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Instructions */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white/80 mb-3">Instructions</h3>
              <ol className="space-y-2">
                {workout.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/60">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#09cadb]/15 text-[#09cadb] text-xs flex items-center justify-center font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
