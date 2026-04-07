import { Link } from 'react-router-dom';

const links = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/refund-policy', label: 'Refunds' },
  { to: '/disclaimer', label: 'Disclaimer' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] mt-auto">
      {/* Mobile: stacked · md+: single row with equal spacing */}
      {/* pb-20 on mobile clears the fixed bottom navigation bar */}
      <div className="max-w-6xl mx-auto pt-6 pb-20 md:pb-6 px-5 sm:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center justify-center md:justify-start shrink-0">
          <img src="/logo.png" alt="OwnGains" className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg object-cover" />
          <span className="font-semibold text-text-secondary text-xs">OwnGains</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 md:gap-x-6">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-[11px] text-text-muted hover:text-text-primary transition-colors hover:underline underline-offset-4"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-[11px] text-text-muted/50 text-center md:text-right shrink-0">
          &copy; {new Date().getFullYear()} OwnGains. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export function LoginAgreement() {
  return (
    <p className="text-center text-text-muted text-xs">
      By continuing, you agree to our{' '}
      <Link to="/terms" className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors">
        Terms
      </Link>{' '}
      &{' '}
      <Link to="/privacy-policy" className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors">
        Privacy Policy
      </Link>
    </p>
  );
}
