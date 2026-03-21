import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  User,
  BookOpen,
  Menu,
  X,
  Flame,
  Zap,
  LogOut,
} from 'lucide-react';
import useUserStore from '../../store/useUserStore';
import useAuthStore from '../../store/useAuthStore';

const bottomTabs = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/diet', label: 'Diet', icon: UtensilsCrossed },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/profile', label: 'Profile', icon: User },
];

const desktopItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/workout', label: 'Workout', icon: Dumbbell },
  { path: '/diet', label: 'Diet', icon: UtensilsCrossed },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/knowledge', label: 'Learn', icon: BookOpen },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentStreak = useUserStore((s) => s.currentStreak);
  const level = useUserStore((s) => s.level);
  const signOut = useAuthStore((s) => s.signOut);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <img src="/logo.jpeg" alt="GymThozhan" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover group-hover:scale-105 transition-transform" />
              <span className="text-base font-bold hidden sm:block tracking-tight">
                GymThozhan
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
              {desktopItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white/10 text-text-primary'
                        : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2.2 : 1.6} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {currentStreak > 0 && (
                <div className="flex items-center gap-1.5 text-text-secondary text-xs font-medium px-2.5 py-1 rounded-md bg-white/[0.04]">
                  <Flame size={13} className="text-accent" />
                  {currentStreak}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-text-secondary text-xs font-medium px-2.5 py-1 rounded-md bg-white/[0.04]">
                <Zap size={13} />
                Lv.{level}
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-white/[0.04] transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed top-[57px] left-4 right-4 z-50 bg-[#111] rounded-xl md:hidden overflow-hidden border border-white/[0.06]"
            >
              <div className="p-2">
                <Link
                  to="/knowledge"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/knowledge'
                      ? 'bg-white/10 text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  }`}
                >
                  <BookOpen size={18} />
                  Knowledge Hub
                </Link>
                <div className="border-t border-white/[0.06] my-1" />
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-black/95 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
            {bottomTabs.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[52px] relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomTabIndicator"
                      className="absolute -top-1.5 w-6 h-[2px] rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className={`p-1 transition-all ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
