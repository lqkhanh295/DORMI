import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import React from 'react';
import { LogOut } from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface FloatingNavProps {
  items: NavItem[];
  onLogout?: () => void;
}

export function FloatingNav({ items, onLogout }: FloatingNavProps) {
  const location = useLocation();

  // ponytail: Functional clay floating navbar with level 1 clay shadow and 44px min touch targets
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:bottom-auto md:top-6">
      <div className="flex items-center gap-2 px-3 py-2 bg-white shadow-[0_10px_25px_-5px_rgba(15,23,42,0.10),0_8px_10px_-6px_rgba(15,23,42,0.05)] border border-[#E2E8F0] rounded-full">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/tenant' && item.path !== '/landlord' && location.pathname.startsWith(item.path + '/'));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center justify-center w-[44px] h-[44px] rounded-full transition-colors ${
                isActive ? 'text-[#00153D]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
              }`}
              title={item.name}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-slate-100 border border-slate-200 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center w-full h-full">
                {item.icon}
              </span>
            </Link>
          );
        })}

        {onLogout && (
          <>
            <div className="w-[1px] h-6 bg-[#E2E8F0] mx-1" />
            <button
              onClick={onLogout}
              className="relative flex items-center justify-center w-[44px] h-[44px] rounded-full text-[#64748B] hover:text-[#C62828] hover:bg-rose-50 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
