import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-20 bg-[#00153D] text-white relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(7,51,114,0.6),transparent_50%)] pointer-events-none" />
      
      <div className="container-dormi relative z-10 text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
          Bắt đầu tìm phòng hoặc kết nối người ở ghép ngay hôm nay
        </h2>
        
        <p className="text-slate-300 text-base max-w-xl mx-auto font-normal leading-relaxed">
          Hàng trăm căn phòng được xác minh thực tế và những người bạn cùng phòng lý tưởng đang chờ bạn trên DORMI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link 
            to="/search" 
            className="w-full sm:w-auto bg-[#F2A900] hover:bg-[#d99700] text-[#00153D] font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>Tìm phòng ngay</span>
          </Link>
          <Link 
            to="/landlord" 
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-7 py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Dành cho chủ nhà trọ</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
