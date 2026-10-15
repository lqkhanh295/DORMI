import { Link, useLocation } from 'react-router-dom';

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

  // ponytail: Local sub-navbar height 56px, level 1 clay shadow, 44px touch targets
  return (
    <div className="sticky top-[56px] z-[9998] w-full border-b border-[#E2E8F0] bg-white/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ease-out">
      <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">{title}</h2>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`transition-colors min-h-[44px] flex items-center ${isActive ? 'text-[#00153D] font-bold border-b-2 border-[#00153D]' : 'text-[#475569] hover:text-[#0F172A]'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {actionLabel && (
            <button onClick={onAction} className="btn-clay-primary text-white text-sm font-medium px-4 py-2">
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
