import { GlobalNav } from '../components/ui/GlobalNav';
import { SectionHero } from '../components/ui/SectionHero';
import { AppleButton } from '../components/ui/AppleButton';
import { BentoCard } from '../components/ui/BentoCard';
import { Link } from 'react-router-dom';
import { PlayCircle } from '@phosphor-icons/react';

export function Landing() {
  return (
    <div className="bg-[#1d1d1f] min-h-screen">
      <GlobalNav />
      
      <main className="pt-[44px]">
        {/* Dark Hero Section (like iPhone Pro page) */}
        <section className="relative flex flex-col items-center justify-center pt-24 pb-32 text-center text-[#f5f5f7]">
          <SectionHero 
            dark
            eyebrow="Dormi Pro"
            title={
              <>
                Tìm phòng trọ.<br/>
                Chuẩn mới.
              </>
            }
            subtitle="Trải nghiệm nền tảng tìm phòng cao cấp với hình ảnh 3D chân thực, xác thực chính chủ và ghép phòng thông minh."
          >
            <Link to="/search">
              <AppleButton size="lg" className="px-8 text-[17px]">Tìm phòng ngay</AppleButton>
            </Link>
            <button className="flex items-center gap-2 text-[17px] text-[#2997ff] hover:underline font-medium px-4">
              Xem video giới thiệu <PlayCircle className="w-5 h-5" />
            </button>
          </SectionHero>

          <div className="mt-20 w-full max-w-[1200px] px-6">
            <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-black shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop" 
                alt="Dormi Platform" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-12">
                <p className="text-[28px] font-semibold">Tất cả trong một ứng dụng duy nhất.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings Section */}
        <section className="bg-[#f5f5f7] py-24">
          <div className="apple-container">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-[40px] font-bold text-[#1d1d1f] leading-tight tracking-tight">Phòng nổi bật</h2>
                <p className="text-[17px] text-[#6e6e73] mt-2">Được xác thực 100% chính chủ. Đánh giá tốt nhất.</p>
              </div>
              <Link to="/search" className="text-[#0071e3] hover:underline font-medium flex items-center gap-1">
                Xem tất cả &gt;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: '1', type: 'Studio', title: 'Studio Quận 1 - Full nội thất', price: '5,500,000', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80' },
                { id: '2', type: 'Ký túc xá', title: 'KTX Cao Cấp - Bách Khoa', price: '1,500,000', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80' },
                { id: '3', type: 'Căn hộ', title: 'Căn hộ dịch vụ Landmark 81', price: '15,000,000', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80' },
                { id: '4', type: 'Phòng riêng', title: 'Phòng ban công lớn Quận 7', price: '4,200,000', img: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=400&q=80' }
              ].map((room) => (
                <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={room.img} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">{room.type}</div>
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      Đã xác thực
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[#1d1d1f] mb-1 line-clamp-1">{room.title}</h3>
                    <div className="mt-auto pt-2">
                      <p className="text-blue-600 font-bold text-lg">{room.price}₫<span className="text-sm text-gray-500 font-normal">/tháng</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* White Grid Section (like iPad/Mac grid) */}
        <section className="bg-white py-24">
          <div className="apple-container">
            <div className="text-center mb-16">
              <h2 className="text-[48px] font-bold text-[#1d1d1f] leading-tight tracking-tight">
                Không gian nào dành cho bạn?
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Feature 1 */}
              <BentoCard hoverEffect noPadding className="h-[400px] bg-[#f5f5f7] flex flex-col items-center text-center">
                <div className="pt-10 px-6">
                  <h3 className="text-[28px] font-semibold text-[#1d1d1f]">Studio</h3>
                  <p className="text-[17px] text-[#6e6e73] mt-2">Đầy đủ tiện nghi,<br/>sẵn sàng dọn vào.</p>
                </div>
                <div className="mt-auto h-1/2 w-full">
                   <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="Studio" />
                </div>
              </BentoCard>

              {/* Feature 2 */}
              <BentoCard hoverEffect noPadding className="h-[400px] bg-[#f5f5f7] flex flex-col items-center text-center">
                <div className="pt-10 px-6">
                  <h3 className="text-[28px] font-semibold text-[#1d1d1f]">Ký túc xá</h3>
                  <p className="text-[17px] text-[#6e6e73] mt-2">Tiết kiệm chi phí,<br/>không gian chung.</p>
                </div>
                <div className="mt-auto h-1/2 w-full">
                   <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" alt="KTX" />
                </div>
              </BentoCard>

              {/* Feature 3 (Span 2) */}
              <BentoCard hoverEffect noPadding className="h-[400px] md:col-span-2 bg-[#1d1d1f] flex flex-col text-left relative overflow-hidden">
                <div className="absolute inset-0">
                  <img src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="Room" />
                </div>
                <div className="relative z-10 p-12 h-full flex flex-col justify-end">
                  <p className="text-[14px] font-semibold uppercase tracking-widest text-white/70 mb-2">Tính năng mới</p>
                  <h3 className="text-[40px] font-bold text-white leading-tight mb-4">Xem không gian 3D. <br/>Ngay trên trình duyệt.</h3>
                  <AppleButton variant="outline" className="w-fit text-white border-white hover:bg-white hover:text-black">Khám phá ngay</AppleButton>
                </div>
              </BentoCard>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <BentoCard hoverEffect className="h-[300px] flex flex-col justify-center items-center text-center">
                <h3 className="text-[32px] font-semibold text-[#1d1d1f] mb-4">Tìm bạn cùng phòng thông minh.</h3>
                <p className="text-[17px] text-[#6e6e73] mb-6 max-w-[300px]">Thuật toán AI tự động ghép nối bạn với những người có chung sở thích.</p>
                <Link to="/customer/matcher" className="text-[#0071e3] text-[17px] hover:underline flex items-center gap-1">
                  Trải nghiệm AI Matcher &gt;
                </Link>
              </BentoCard>
              
              <BentoCard hoverEffect className="h-[300px] flex flex-col justify-center items-center text-center">
                <h3 className="text-[32px] font-semibold text-[#1d1d1f] mb-4">Bảo vệ quyền lợi của bạn.</h3>
                <p className="text-[17px] text-[#6e6e73] mb-6 max-w-[300px]">100% chủ nhà trên Dormi đều phải trải qua quá trình xác thực KYC.</p>
                <Link to="/search" className="text-[#0071e3] text-[17px] hover:underline flex items-center gap-1">
                  Tìm hiểu thêm về Bảo mật &gt;
                </Link>
              </BentoCard>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f5f5f7] py-12 border-t border-[#d2d2d7]">
        <div className="apple-container text-[12px] text-[#6e6e73]">
          <p className="mb-4">Dormi không thu phí trung gian. Để xem thông tin liên hệ của chủ nhà, bạn cần đăng nhập.</p>
          <div className="border-t border-[#d2d2d7] pt-4 flex flex-col md:flex-row justify-between">
            <p>Bản quyền © 2026 Dormi Inc. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4 mt-2 md:mt-0">
              <Link to="#" className="hover:text-[#1d1d1f]">Chính sách quyền riêng tư</Link>
              <Link to="#" className="border-l border-[#d2d2d7] pl-4 hover:text-[#1d1d1f]">Điều khoản sử dụng</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
