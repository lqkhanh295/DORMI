import { GlobalNav } from '../../components/ui/GlobalNav';
import { AppleButton } from '../../components/ui/AppleButton';
import { BentoCard } from '../../components/ui/BentoCard';
import { MapPin, Info, Selection, Star, CurrencyCircleDollar } from '@phosphor-icons/react';

export function RoomDetail() {
  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <GlobalNav />
      
      {/* Product sticky header (like Apple Store) */}
      <div className="sticky top-[44px] z-[9998] w-full border-b border-[#D2D2D7] bg-[rgba(255,255,255,0.72)] backdrop-blur-[20px] saturate-[180%] transition-all duration-300">
        <div className="mx-auto flex h-[52px] max-w-[980px] items-center justify-between px-4 sm:px-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">Studio Nguyễn Hữu Cảnh</h2>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[17px] font-bold text-[#1d1d1f]">5.000.000đ/tháng</span>
            <AppleButton size="sm">Đặt lịch xem</AppleButton>
          </div>
        </div>
      </div>

      <main className="apple-container pt-8 pb-24">
        {/* Gallery */}
        <div className="w-full h-[60vh] rounded-[24px] overflow-hidden mb-12 relative bg-black">
          <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-90" alt="Room" />
          <div className="absolute bottom-6 right-6 flex gap-2">
            <AppleButton variant="dark" size="sm">Xem 3D</AppleButton>
            <AppleButton variant="dark" size="sm">Xem tất cả ảnh</AppleButton>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-[40px] font-bold text-[#1d1d1f] leading-tight mb-2">Studio sáng sủa, view thành phố.</h1>
              <p className="flex items-center gap-2 text-[17px] text-[#6e6e73]">
                <MapPin className="h-5 w-5" />
                Vinhomes Central Park, Bình Thạnh, TP.HCM
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-12">
              <BentoCard noPadding className="bg-white p-6 rounded-[16px] border border-[#d2d2d7]/50 flex flex-col items-center text-center">
                <Selection className="w-8 h-8 text-[#0071e3] mb-2" />
                <p className="text-[14px] text-[#6e6e73]">Diện tích</p>
                <p className="text-[17px] font-semibold text-[#1d1d1f]">35m²</p>
              </BentoCard>
              <BentoCard noPadding className="bg-white p-6 rounded-[16px] border border-[#d2d2d7]/50 flex flex-col items-center text-center">
                <CurrencyCircleDollar className="w-8 h-8 text-[#34c759] mb-2" />
                <p className="text-[14px] text-[#6e6e73]">Tiền cọc</p>
                <p className="text-[17px] font-semibold text-[#1d1d1f]">1 tháng</p>
              </BentoCard>
              <BentoCard noPadding className="bg-white p-6 rounded-[16px] border border-[#d2d2d7]/50 flex flex-col items-center text-center">
                <Info className="w-8 h-8 text-[#ff9500] mb-2" />
                <p className="text-[14px] text-[#6e6e73]">Trạng thái</p>
                <p className="text-[17px] font-semibold text-[#1d1d1f]">Trống</p>
              </BentoCard>
            </div>

            <div className="mb-12">
              <h2 className="text-[28px] font-bold text-[#1d1d1f] mb-4">Chi tiết.</h2>
              <p className="text-[17px] text-[#1d1d1f] leading-relaxed">
                Phòng thiết kế theo phong cách hiện đại tối giản. Có sẵn nội thất cao cấp: giường lò xo, tủ quần áo âm tường, bàn làm việc, tủ lạnh và máy lạnh Inverter. Giờ giấc tự do, có khóa vân tay 2 lớp an ninh tuyệt đối. Không chung chủ.
              </p>
            </div>
            
            <div>
               <h2 className="text-[28px] font-bold text-[#1d1d1f] mb-4">Tiện ích.</h2>
               <div className="grid grid-cols-2 gap-y-4 text-[17px] text-[#1d1d1f]">
                 <div className="flex items-center gap-2">✓ Máy lạnh</div>
                 <div className="flex items-center gap-2">✓ Máy giặt riêng</div>
                 <div className="flex items-center gap-2">✓ Tủ lạnh</div>
                 <div className="flex items-center gap-2">✓ Bếp từ</div>
                 <div className="flex items-center gap-2 text-[#6e6e73] line-through">✗ Thang máy</div>
                 <div className="flex items-center gap-2 text-[#6e6e73] line-through">✗ Chỗ đậu ô tô</div>
               </div>
            </div>
          </div>

          <div className="relative">
            <BentoCard className="bg-white sticky top-[120px] border border-[#d2d2d7]/50 p-6 flex flex-col gap-6">
              <div className="flex items-start gap-4 pb-6 border-b border-[#d2d2d7]/50">
                <div className="w-16 h-16 rounded-full bg-[#e8e8ed] overflow-hidden shrink-0">
                  <img src="https://i.pravatar.cc/150?img=68" alt="Host" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Trần Đại Chủ</h3>
                  <div className="flex items-center gap-1 text-[13px] text-[#6e6e73] mt-1">
                    <Star weight="fill" className="text-[#ff9500]" /> 4.9 (12 đánh giá)
                  </div>
                  <span className="inline-block mt-2 rounded-full bg-[#34c759]/10 px-2 py-0.5 text-[11px] font-bold text-[#34c759] uppercase tracking-wider">Đã xác minh KYC</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <AppleButton fullWidth>Chat với chủ nhà</AppleButton>
                <AppleButton fullWidth variant="secondary">Đặt lịch xem phòng</AppleButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </main>
    </div>
  );
}
