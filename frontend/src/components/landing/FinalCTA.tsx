import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  PhoneCall, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  X, 
  Clock 
} from 'lucide-react';
import { toast } from 'sonner';

export function FinalCTA() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      toast.success('Đã sao chép địa chỉ email hỗ trợ!');
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      toast.success('Đã sao chép số điện thoại hotline!');
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <section className="py-20 bg-[#00153D] text-white relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(7,51,114,0.6),transparent_50%)] pointer-events-none" />
      
      <div className="container-dormi relative z-10 text-center max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#F2A900] text-xs font-bold border border-white/20">
            <CheckCircle className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Nền tảng mở công khai - Không cần đăng nhập để trải nghiệm</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Trải nghiệm tìm trọ & ở ghép thế hệ mới ngay hôm nay
          </h2>
          
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            Hàng trăm phòng trọ đã xác thực 3 lớp, tour 3D thực tế và thuật toán gợi ý bạn cùng phòng tương thích đang sẵn sàng phục vụ bạn.
          </p>
        </div>

        {/* 3 Action Buttons: Dùng thử / Đăng ký / Liên hệ */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {/* 1. Dùng thử tìm phòng */}
          <Link 
            to="/search" 
            className="w-full sm:w-auto bg-[#F2A900] hover:bg-[#d99700] text-[#00153D] font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Search className="w-4 h-4 text-[#00153D]" />
            <span>Dùng thử tìm phòng</span>
          </Link>

          {/* 2. Đăng ký tài khoản */}
          <Link 
            to="/auth?tab=register" 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Đăng ký tài khoản</span>
          </Link>

          {/* 3. Liên hệ hỗ trợ */}
          <button 
            type="button"
            onClick={() => setShowContactModal(true)}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold px-6 py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-[#F2A900]" />
            <span>Liên hệ hỗ trợ</span>
          </button>
        </div>
      </div>

      {/* Modal Liên hệ hỗ trợ */}
      {showContactModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-white text-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 relative text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Liên hệ hỗ trợ DORMI</h3>
                <p className="text-xs text-slate-500">Đội ngũ sẵn sàng giải đáp thắc mắc 24/7</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* Hotline / Phone */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Hotline / Zalo hỗ trợ</span>
                    <a href="tel:0901234567" className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                      0901 234 567
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('0901234567', 'phone')}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition-all cursor-pointer"
                  title="Sao chép số điện thoại"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Email */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Email chính thức</span>
                    <a href="mailto:contact@dormi.space" className="font-bold text-slate-800 hover:text-blue-600 transition-colors">
                      contact@dormi.space
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('contact@dormi.space', 'email')}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition-all cursor-pointer"
                  title="Sao chép email"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Working hours & Location */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600">Thời gian phản hồi: 08:00 - 22:00 tất cả các ngày trong tuần.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600">Địa chỉ: Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <a
                href="mailto:contact@dormi.space"
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gửi email ngay</span>
              </a>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
