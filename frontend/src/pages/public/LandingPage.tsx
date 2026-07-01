import { Link } from 'react-router-dom';
import { PlayCircle, ShieldCheck, Star, Prohibit, Headphones } from '@phosphor-icons/react';

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#fbfbfd] selection:bg-blue-500/20">
      {/* HERO SECTION - APPLE STYLE LIGHT & CLEAN */}
      <section className="group relative w-full min-h-[90vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden pt-12 md:pt-20 pb-20 md:pb-32">
        {/* Soft Pastel Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[120px]"></div>

        {/* Main Hero Content */}
        <div className="relative z-10 w-full max-w-[1200px] px-4 sm:px-6 mx-auto flex flex-col items-center text-center mt-4 md:mt-8">


          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-gray-900 mb-4 md:mb-6 tracking-tighter leading-tight pb-2">
            Tìm trọ thông minh, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              kết nối cộng đồng.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-500 mb-8 md:mb-12 max-w-2xl font-normal leading-relaxed">
            Trải nghiệm tìm kiếm phòng trọ và người ở ghép hoàn hảo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
            <Link to="/search" className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 md:py-4 font-bold text-white transition-all duration-300 bg-blue-600 rounded-full hover:bg-blue-500 overflow-hidden shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
              <span className="relative flex items-center gap-2 z-10 text-base md:text-lg">
                Trải nghiệm ngay <PlayCircle className="w-5 h-5 md:w-6 md:h-6" weight="fill" />
              </span>
            </Link>
          </div>
        </div>

        {/* Floating Dashboard Mockup - Hidden on mobile */}
        <div className="hidden md:block absolute -bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-[400px] bg-gradient-to-t from-[#fbfbfd] via-[#fbfbfd]/80 to-transparent z-20 pointer-events-none"></div>
        <div className="hidden md:flex absolute -bottom-16 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl rounded-t-[40px] border border-gray-200 bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.05)] overflow-hidden flex-col transform translate-y-8 scale-95 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-1000 ease-out">
          <div className="h-12 border-b border-gray-100 flex items-center px-6 gap-2 bg-gray-50/50">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 p-8">
            <div className="w-full h-32 bg-gray-50 rounded-2xl mb-6 flex gap-4 p-4 border border-gray-100">
              <div className="w-32 h-full bg-white rounded-xl shadow-sm border border-gray-100"></div>
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="w-1/2 h-4 bg-gray-200 rounded-full"></div>
                <div className="w-1/3 h-4 bg-gray-100 rounded-full"></div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-1/3 h-24 bg-gray-50 rounded-2xl border border-gray-100"></div>
              <div className="w-1/3 h-24 bg-gray-50 rounded-2xl border border-gray-100"></div>
              <div className="w-1/3 h-24 bg-gray-50 rounded-2xl border border-gray-100"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ALGORITHMIC SECTION - DÀNH RIÊNG CHO BẠN */}
      <section className="bg-white py-16 md:py-32 border-t border-gray-100 w-full relative z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-[42px] font-black text-gray-900 leading-tight tracking-tight flex flex-wrap items-center gap-3 md:gap-4">
                Phòng trọ nổi bật
                <span className="bg-blue-50 text-blue-600 text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-blue-100 mt-1 md:mt-0">Gợi ý thông minh</span>
              </h2>
              <p className="text-gray-500 mt-2 md:mt-4 text-base md:text-xl">Dựa trên tiêu chuẩn cao và ảnh đã được kiểm duyệt.</p>
            </div>
            <Link to="/search" className="inline-flex text-gray-600 hover:text-gray-900 font-bold items-center gap-2 bg-gray-50 px-5 md:px-6 py-2.5 md:py-3 rounded-full transition-colors border border-gray-200 hover:bg-gray-100 text-sm md:text-base">
              Khám phá thêm
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { id: '1', title: 'Phòng ban công thoáng Quận 10', price: '4,500,000', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80', score: 98 },
              { id: '2', title: 'Studio ngập nắng Tân Bình', price: '5,200,000', img: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=400&q=80', score: 95 },
              { id: '3', title: 'KTX cao cấp Quận 7 (Nam)', price: '1,800,000', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80', score: 99 },
              { id: '4', title: 'Căn hộ mini an ninh Phú Nhuận', price: '6,000,000', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80', score: 94 }
            ].map((room) => (
              <Link to={`/room/${room.id}`} key={room.id} className="block group relative bg-white rounded-[20px] md:rounded-[24px] overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2">
                <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
                  <img src={room.img} alt={room.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur text-gray-900 border border-gray-200 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold shadow-sm flex items-center gap-1">
                      <ShieldCheck weight="fill" className="w-3 h-3 text-green-500" /> Verified
                    </span>
                  </div>
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-1.5 md:mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-base md:text-[17px]">{room.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs md:text-sm font-semibold text-orange-500 mb-3 md:mb-4">
                    <Star weight="fill" className="w-3.5 h-3.5 md:w-4 md:h-4" /> {room.score} Điểm tin cậy
                  </div>
                  <p className="text-blue-600 font-black text-lg md:text-xl tracking-tight">{room.price}₫<span className="text-xs md:text-sm text-gray-400 font-medium tracking-normal ml-1">/tháng</span></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BODY CONTENT - BENTO GRID 4 CỘT */}
      <section className="px-4 sm:px-6 py-16 md:py-32 mx-auto max-w-[1200px] relative z-30">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4 tracking-tight">Tính năng đột phá</h2>
          <p className="text-gray-500 text-base md:text-xl">Mọi thứ bạn cần để tìm được nơi ở ưng ý nhất.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 md:auto-rows-[280px]">

          {/* Card 1: Phòng trọ xác thực (2x2) */}
          <div className="md:col-span-2 md:row-span-2 min-h-[300px] md:min-h-0 relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2">
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              alt="Phòng mẫu"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 md:p-8 flex flex-col justify-end">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">Căn hộ dịch vụ cao cấp cửa sổ lớn</h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                <p className="text-gray-200 text-base md:text-lg">Quận Bình Thạnh</p>
                <p className="text-xl md:text-2xl font-black text-white bg-black/30 backdrop-blur px-4 py-1.5 md:px-5 md:py-2 rounded-2xl w-max">5.5tr<span className="text-xs md:text-sm font-normal text-white/80 ml-1">/tháng</span></p>
              </div>
            </div>
          </div>

          {/* Card 2: Tìm bạn ở ghép (2x1) */}
          <div className="md:col-span-2 md:row-span-1 min-h-[220px] md:min-h-0 rounded-[24px] md:rounded-[32px] overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 flex flex-col justify-center relative group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Tìm mảnh ghép hoàn hảo</h3>
            <p className="text-gray-500 mb-4 md:mb-6 max-w-sm text-sm md:text-lg">Thuật toán ghép nối dựa trên thói quen và lối sống của bạn.</p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium"><Prohibit className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" /> Không hút thuốc</span>
              <span className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium"><Headphones className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" /> Hướng nội</span>
            </div>
            <Link to="/tenant/match" className="absolute inset-0 z-20"></Link>
          </div>

          {/* Card 3: Thống kê nhanh (1x1) */}
          <div className="md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-0 rounded-[24px] md:rounded-[32px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 flex flex-col justify-center items-center text-center transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2">
            <div className="text-5xl md:text-6xl font-black text-blue-600 mb-2 md:mb-4 tracking-tighter">248+</div>
            <p className="text-gray-500 font-medium text-sm md:text-lg leading-tight">Phòng trọ mới<br />đăng trong 24h qua</p>
          </div>

          {/* Card 4: Gợi ý AI (1x1) */}
          <div className="md:col-span-1 md:row-span-1 min-h-[160px] md:min-h-0 rounded-[24px] md:rounded-[32px] bg-blue-50 border border-blue-100 shadow-sm p-6 flex flex-col justify-center items-center text-center relative group cursor-pointer transition-all duration-500 hover:shadow-md hover:-translate-y-2">
            <h4 className="text-xl md:text-2xl font-bold text-blue-900 mb-2 mt-2 md:mt-4">Gợi ý từ AI</h4>
            <p className="text-blue-700/80 font-medium text-sm md:text-base">Có 5 sinh viên phù hợp quanh khu vực của bạn</p>
            <Link to="/tenant/match" className="absolute inset-0 z-20"></Link>
          </div>

        </div>
      </section>
    </div>
  );
}
