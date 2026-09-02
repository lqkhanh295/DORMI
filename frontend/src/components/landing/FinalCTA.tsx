import { Link } from 'react-router-dom';

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24 bg-[#F5F7FA]">
      <div className="container-dormi">
        <div className="bg-white rounded-[18px] shadow-clay-soft p-8 md:p-12 text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-h2 text-[#0F172A]">
            Bắt đầu tìm phòng hoặc đăng tin ngay hôm nay.
          </h2>
          <p className="text-body text-[#64748B] max-w-xl mx-auto">
            Hàng trăm căn phòng được xác minh và người ở ghép tương thích đang chờ bạn trên DORMI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              to="/search" 
              className="w-full sm:w-auto btn-clay-primary font-semibold px-8 py-3 rounded-[12px] min-h-[44px] text-body flex items-center justify-center"
            >
              Tìm phòng ngay
            </Link>
            <Link 
              to="/landlord" 
              className="w-full sm:w-auto bg-white text-[#0F172A] border border-[#E2E8F0] shadow-clay-soft hover:-translate-y-0.5 font-semibold px-8 py-3 rounded-[12px] transition-all min-h-[44px] text-body flex items-center justify-center"
            >
              Đăng tin ngay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
