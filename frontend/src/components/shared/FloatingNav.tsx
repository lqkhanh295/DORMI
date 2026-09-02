import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import React from 'react';

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
      <div className="flex items-center gap-2 px-3 py-2 bg-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.15),inset_0_-4px_0_0_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-[#E5E7EB] rounded-full">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/tenant' && item.path !== '/landlord' && location.pathname.startsWith(item.path + '/'));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center justify-center w-[44px] h-[44px] rounded-full transition-colors ${
                isActive ? 'text-[#6366F1]' : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6]'
              }`}
              title={item.name}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-[#EEF2FF] border border-[#6366F1]/30 rounded-full"
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
            <div className="w-[1px] h-6 bg-[#E5E7EB] mx-1" />
            <button
              onClick={onLogout}
              className="relative flex items-center justify-center w-[44px] h-[44px] rounded-full text-[#6B7280] hover:text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
              title="Đăng xuất"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
