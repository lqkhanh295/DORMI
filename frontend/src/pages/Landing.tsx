import { GlobalNav } from '../components/ui/GlobalNav';
import { Link } from 'react-router-dom';
import { PlayCircle, ShieldCheck, MapPin, Star, House, Sparkle } from '@phosphor-icons/react';

export function Landing() {
  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <GlobalNav />
      
      <main className="pt-[60px]">
        {/* HERO SECTION - CHẠM LÀ MÊ */}
        <section className="relative w-full px-4 sm:px-6 py-8 mx-auto max-w-[1200px]">
          <div className="relative w-full aspect-[21/9] min-h-[400px] rounded-[32px] overflow-hidden bg-black shadow-2xl group flex items-center justify-center text-center">
            <img 
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop" 
              alt="Dormi Platform 3D" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            <div className="relative z-10 p-8 flex flex-col items-center">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg max-w-3xl leading-tight">
                Tìm trọ thông minh, <br className="hidden md:block"/>kết nối cộng đồng.
              </h1>
              
              <Link to="/search" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary rounded-full hover:bg-primary-600 overflow-hidden">
                <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
                <div className="absolute inset-0 w-full h-full transition-all duration-500 ease-out bg-white/20 blur-md group-hover:blur-xl"></div>
                <span className="relative flex items-center gap-2">
                  Trải nghiệm thực tế ảo ngay <PlayCircle className="w-5 h-5" weight="fill" />
                </span>
                {/* Glow effect shadow */}
                <div className="absolute -inset-2 bg-primary/40 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </div>
          </div>
        </section>

        {/* BODY CONTENT - BENTO GRID 4 CỘT */}
        <section className="px-4 sm:px-6 pb-24 mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 md:auto-rows-[250px]">
            
            {/* Card 1: Phòng trọ xác thực (2x2) */}
            <div className="md:col-span-2 md:row-span-2 relative rounded-[32px] overflow-hidden bg-white shadow-sm border border-gray-100 group cursor-pointer transition-shadow hover:shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Phòng mẫu" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-500/90 backdrop-blur text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                    <ShieldCheck weight="fill" className="w-4 h-4" /> Đã xác thực
                  </span>
                  <span className="bg-yellow-500/90 backdrop-blur text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star weight="fill" className="w-4 h-4" /> Phòng tốt
                  </span>
                  <span className="bg-white/90 backdrop-blur text-gray-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                    <House weight="fill" className="w-4 h-4" /> Chính chủ
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2 leading-tight">Căn hộ dịch vụ cao cấp cửa sổ lớn</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-200 flex items-center gap-1"><MapPin weight="fill" /> Quận Bình Thạnh</p>
                  <p className="text-2xl font-black text-white bg-primary/90 backdrop-blur px-4 py-1.5 rounded-2xl shadow-lg">5.5tr<span className="text-sm font-normal opacity-80">/tháng</span></p>
                </div>
              </div>
            </div>

            {/* Card 2: Tìm bạn ở ghép (2x1) */}
            <div className="md:col-span-2 md:row-span-1 rounded-[32px] overflow-hidden bg-white shadow-sm border border-gray-100 p-8 flex flex-col justify-center relative group cursor-pointer hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 z-10">Tìm mảnh ghép hoàn hảo</h3>
              <p className="text-gray-500 mb-4 max-w-sm z-10">Thuật toán ghép nối dựa trên thói quen và lối sống của bạn.</p>
              <div className="flex flex-wrap gap-2 z-10">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">Không hút thuốc</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Hướng nội</span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Ưa sạch sẽ</span>
              </div>
              <Link to="/customer/matcher" aria-label="Tìm bạn ở ghép" className="absolute inset-0 z-20"></Link>
            </div>

            {/* Card 3: Thống kê nhanh (1x1) */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] bg-foreground shadow-sm p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-5xl font-black text-white mb-2 drop-shadow-md">248+</div>
              <p className="text-gray-200 font-medium leading-tight">Phòng trọ mới<br/>đăng trong 24h qua</p>
            </div>

            {/* Card 4: Gợi ý AI (1x1) */}
            <div className="md:col-span-1 md:row-span-1 rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border border-blue-100 p-6 flex flex-col justify-center items-center text-center relative group cursor-pointer hover:shadow-lg transition-shadow">
              <Sparkle className="w-10 h-10 text-blue-500 mb-3" weight="fill" />
              <h4 className="text-xl font-bold text-gray-900 mb-1">Gợi ý từ AI</h4>
              <p className="text-blue-700 font-medium text-sm">Có 5 sinh viên phù hợp quanh khu vực của bạn</p>
              <Link to="/customer/matcher" className="absolute inset-0"></Link>
            </div>
            
          </div>
        </section>

        {/* ALGORITHMIC SECTION - DÀNH RIÊNG CHO BẠN */}
        <section className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-[32px] font-bold text-gray-900 leading-tight tracking-tight flex items-center gap-3">
                  Phòng trọ phù hợp với bạn
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Gợi ý thông minh</span>
                </h2>
                <p className="text-gray-500 mt-2">Dựa trên Trust Score cao và ảnh đã được AI kiểm duyệt không chỉnh sửa.</p>
              </div>
              <Link to="/search" className="hidden sm:flex text-blue-600 hover:text-blue-700 font-bold items-center gap-1">
                Khám phá thêm &gt;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: '1', title: 'Phòng ban công thoáng Quận 10', price: '4,500,000', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80', score: 98 },
                { id: '2', title: 'Studio ngập nắng Tân Bình', price: '5,200,000', img: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=400&q=80', score: 95 },
                { id: '3', title: 'KTX cao cấp Quận 7 (Nam)', price: '1,800,000', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80', score: 99 },
                { id: '4', title: 'Căn hộ mini an ninh Phú Nhuận', price: '6,000,000', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80', score: 94 }
              ].map((room) => (
                <div key={room.id} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img src={room.img} alt={room.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <ShieldCheck weight="fill" /> Verified
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col gap-0.5 mb-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{room.title}</h3>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium italic">(Update lần cuối: 26.06.2026)</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-orange-500 mb-3">
                      <Star weight="fill" /> Trust Score: {room.score}
                    </div>
                    <p className="text-primary font-black text-lg">{room.price}₫<span className="text-xs text-gray-400 font-medium">/tháng</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-[12px] text-gray-500">
          <p className="mb-4">DORMI - Nền tảng tìm kiếm phòng trọ và bạn cùng phòng thông minh nhất.</p>
          <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row justify-between">
            <p>Bản quyền © 2026 Dormi. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4 mt-2 md:mt-0 font-medium">
              <Link to="#" className="hover:text-gray-900 transition-colors">Chính sách bảo mật</Link>
              <Link to="#" className="border-l border-gray-200 pl-4 hover:text-gray-900 transition-colors">Điều khoản</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
