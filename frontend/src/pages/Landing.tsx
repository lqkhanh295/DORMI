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
