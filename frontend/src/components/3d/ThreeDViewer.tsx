import { useEffect } from 'react';
import { X, Cuboid } from 'lucide-react';

interface ThreeDViewerProps {
  onClose: () => void;
}

// Default export is required for React.lazy()
export default function ThreeDViewer({ onClose }: ThreeDViewerProps) {
  // Prevent background scrolling when 3D modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="w-11/12 h-[80vh] bg-gradient-to-br from-slate-900 to-black rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <Cuboid className="w-24 h-24 text-primary animate-bounce mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Không gian ảo 3D</h2>
        <p className="text-white/60 text-lg">Đang tải mô hình Three.js (Mock)...</p>
        <p className="text-white/40 text-sm mt-4">Kéo thả chuột để xoay góc nhìn</p>
      </div>
    </div>
  );
}
