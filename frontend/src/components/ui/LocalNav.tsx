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
    <div className="sticky top-[56px] z-[9998] w-full border-b border-[#E5E7EB] bg-white/90 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.10),inset_0_-4px_0_0_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <h2 className="text-lg font-bold text-[#1F2937] tracking-tight">{title}</h2>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`transition-colors min-h-[44px] flex items-center ${isActive ? 'text-[#6366F1] font-semibold border-b-2 border-[#6366F1]' : 'text-[#4B5563] hover:text-[#1F2937]'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {actionLabel && (
            <button onClick={onAction} className="btn-clay-primary text-sm font-medium">
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
