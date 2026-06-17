import { useEffect } from 'react';
import { Cube, X } from '@phosphor-icons/react';

interface ThreeDViewerProps {
  onClose: () => void;
}

// Default export is required for React.lazy()
export default function ThreeDViewer({ onClose }: ThreeDViewerProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/80 backdrop-blur-sm duration-300 fade-in">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-8 w-8" />
      </button>

      <div className="flex h-[80vh] w-11/12 animate-in flex-col items-center justify-center rounded-lg border border-white/20 bg-gradient-to-br from-slate-900 to-black shadow-2xl duration-500 zoom-in-95">
        <Cube className="mb-6 h-24 w-24 animate-bounce text-primary" />
        <h2 className="mb-2 text-3xl font-bold text-white">Không gian ảo 3D</h2>
        <p className="text-lg text-white/60">Đang tải mô hình Three.js (Mock)...</p>
        <p className="mt-4 text-sm text-white/40">Kéo thả chuột để xoay góc nhìn</p>
      </div>
    </div>
  );
}
