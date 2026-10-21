import { Link } from 'react-router-dom';
import { Search, UserPlus, PhoneCall, Apple, Play, Smartphone, CheckCircle } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-20 bg-[#00153D] text-white relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(7,51,114,0.6),transparent_50%)] pointer-events-none" />
      
      <div className="container-dormi relative z-10 text-center max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F2A900] text-xs font-bold border border-white/20">
            <CheckCircle className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Nền tảng mở công khai — Không cần đăng nhập để trải nghiệm</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Trải nghiệm tìm trọ & ở ghép thế hệ mới ngay hôm nay
          </h2>
          
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Hàng trăm phòng trọ đã xác thực 3 lớp, tour 3D thực tế và bạn cùng phòng tương thích đang sẵn sàng phục vụ bạn.
          </p>
        </div>

        {/* Action Buttons: Dùng thử / Đăng ký / Liên hệ */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {/* 1. Dùng thử ngay */}
          <Link 
            to="/search" 
            className="w-full sm:w-auto bg-[#F2A900] hover:bg-[#d99700] text-[#00153D] font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            <span>Dùng thử tìm phòng</span>
          </Link>

          {/* 2. Đăng ký tài khoản */}
          <Link 
            to="/auth?tab=register" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký tài khoản</span>
          </Link>

          {/* 3. Liên hệ hỗ trợ */}
          <a 
            href="mailto:contact@dormi.space"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <PhoneCall className="w-4 h-4 text-slate-300" />
            <span>Liên hệ hỗ trợ</span>
          </a>
        </div>

        {/* Mobile Platforms & App Store Badges */}
        <div className="pt-8 border-t border-white/10 max-w-2xl mx-auto">
          <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wider">
            Khả dụng trên mọi nền tảng di động & máy tính
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* App Store Badge */}
            <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-3 transition-colors cursor-default">
              <Apple className="w-6 h-6 text-white" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 uppercase leading-none">Download on the</span>
                <span className="block text-xs font-bold text-white mt-0.5 leading-none">App Store (iOS)</span>
              </div>
            </div>

            {/* Google Play Badge */}
            <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-3 transition-colors cursor-default">
              <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 uppercase leading-none">Get it on</span>
                <span className="block text-xs font-bold text-white mt-0.5 leading-none">Google Play (Android)</span>
              </div>
            </div>

            {/* PWA / Responsive Web */}
            <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-3 transition-colors cursor-default">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-[10px] text-slate-400 uppercase leading-none">Web Mobile PWA</span>
                <span className="block text-xs font-bold text-white mt-0.5 leading-none">Mọi thiết bị di động</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
