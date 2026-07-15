import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';
export const Navbar = () => {
    const location = useLocation();
    const navLinks = [
        { name: 'Mission', path: '/' },
        { name: 'Solutions', path: '/solutions' },
        { name: 'Impact', path: '/impact' },
        { name: 'Campaign', path: '/campaign' },
        { name: 'Achievments', path: '/achievements' },
        { name: 'Founders', path: '/founders' },
        { name: 'Documents', path: '/documents' },
    ];
    return (<nav className="w-full border-b border-gray-300 bg-[var(--color-brand-bg)]">
      <div className="mx-auto flex h-24 max-w-[1400px] items-center justify-between px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 overflow-hidden relative flex-shrink-0">
            <span className="text-[11px] font-extrabold text-gray-800 leading-none text-center relative z-10 mt-2">SpaceECE</span>
            <div className="absolute top-1 left-2.5 h-3.5 w-3.5 bg-[var(--color-brand-orange)] rounded-full opacity-50"></div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[var(--color-brand-orange)]">SpaceECE india foundation</span>
        </Link>
        <div className="hidden lg:flex lg:items-center lg:gap-8 xl:gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.name === 'Mission' && location.pathname === '/');
            return (<Link key={link.name} to={link.path} className={`text-[15px] font-bold pb-1 border-b-[3px] transition-colors mt-1 ${isActive
                    ? 'border-[var(--color-brand-orange)] text-[var(--color-brand-orange)]'
                    : 'border-transparent text-[var(--color-brand-orange)]/70 hover:text-[var(--color-brand-orange)]'}`}>
                {link.name}
              </Link>);
        })}
        </div>
        <div className="flex items-center">
          <Button variant="primary" size="md" className="px-8 shadow-md">Donate now</Button>
        </div>
      </div>
    </nav>);
};
