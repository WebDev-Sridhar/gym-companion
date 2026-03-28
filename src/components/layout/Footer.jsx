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
      <div className="max-w-4xl mx-auto py-8 px-5 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="GymThozhan" className="w-5 h-5 rounded object-cover" />
          <span className="font-bold text-text-secondary text-sm">GymThozhan</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-xs text-text-muted hover:text-text-primary transition-colors hover:underline underline-offset-4"
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-[11px] text-text-muted/50">
          &copy; {new Date().getFullYear()} GymThozhan. All rights reserved.
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
