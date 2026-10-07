import { motion, type HTMLMotionProps } from 'framer-motion';
import { pageVariants } from '../../utils/motion';

// ponytail: Minimal Apple-grade motion primitives for layout continuity and loading skeletons

export function PageMotion({ children, className = '', ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SkeletonCard({ className = '', height = 'h-48' }: { className?: string; height?: string }) {
  return (
    <div className={`bg-white rounded-[18px] p-5 shadow-clay-soft border border-primary-200/40 flex flex-col gap-3 ${className}`}>
      <div className={`w-full ${height} rounded-[14px] skeleton-shimmer`} />
      <div className="h-5 w-3/4 rounded-md skeleton-shimmer" />
      <div className="h-4 w-1/2 rounded-md skeleton-shimmer" />
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-primary-100">
        <div className="h-4 w-20 rounded-md skeleton-shimmer" />
        <div className="h-4 w-16 rounded-md skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-primary-200/40 p-4">
      <div className="h-10 rounded-[10px] skeleton-shimmer mb-3" />
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center py-2.5 border-b border-primary-100 last:border-b-0">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 rounded-md skeleton-shimmer"
                style={{ width: j === 0 ? '25%' : j === cols - 1 ? '15%' : `${(60 / Math.max(1, cols - 2))}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
