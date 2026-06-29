import { Link, useLocation } from 'react-router-dom';
import { AppleButton } from './AppleButton';

interface NavItem {
  label: string;
  path: string;
}

export interface LocalNavProps {
  title: string;
  items: NavItem[];
  actionLabel?: string;
  onAction?: () => void;
}

export function LocalNav({ title, items, actionLabel, onAction }: LocalNavProps) {
  const location = useLocation();

  return (
    <div className="sticky top-[44px] z-[9998] w-full border-b border-[#D2D2D7] bg-[rgba(255,255,255,0.72)] backdrop-blur-[20px] saturate-[180%] transition-all duration-300">
      <div className="mx-auto flex h-[52px] max-w-[980px] items-center justify-between px-4 sm:px-6">
        <h2 className="text-[21px] font-semibold text-[#1D1D1F] tracking-tight">{title}</h2>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-[12px] font-medium">
            {items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`transition-colors ${isActive ? 'text-[#1D1D1F]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {actionLabel && (
            <AppleButton size="sm" onClick={onAction}>{actionLabel}</AppleButton>
          )}
        </div>
      </div>
    </div>
  );
}
