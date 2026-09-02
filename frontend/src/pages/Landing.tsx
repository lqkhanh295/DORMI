import { GlobalNav } from '../components/ui/GlobalNav';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkle, Star } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'framer-motion';

export function Landing() {
  const reduce = useReducedMotion();

  return (
    <div className="bg-canvas min-h-screen">
      <GlobalNav />
      
      <main>
        {/* HERO SECTION - Split Screen Asymmetric */}
        <section className="relative w-full mx-auto max-w-[1400px] min-h-[100dvh] pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          <div className="flex-1 max-w-xl z-10 w-full pt-12 md:pt-0">
            <motion.h1 
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[48px] md:text-[64px] lg:text-[80px] font-bold text-text-primary leading-[1.05] tracking-tight mb-8"
            >
              Tìm trọ thông minh, <br className="hidden md:block"/>sống trọn vẹn.
            </motion.h1>
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/search" className="btn-spatial shadow-sm">
                Tìm phòng <ArrowRight className="w-5 h-5 ml-2" weight="bold" />
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex-1 w-full relative h-[50vh] md:h-[80vh] rounded-bento overflow-hidden bg-surface-alt"
          >
            <img 
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop" 
              alt="Không gian sống chuẩn mực" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </section>

        {/* FEATURED ROOMS - Sticky Stack / Staggered Masonry */}
        <section className="bg-surface py-24 md:py-32 relative border-y border-border-subtle">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              
              {/* Left Column: Sticky Title */}
              <div className="lg:col-span-4">
                <div className="sticky top-32">
                  <h2 className="text-[32px] md:text-[40px] font-bold text-text-primary leading-[1.1] tracking-tight mb-4">
                    Không gian<br />nổi bật.
                  </h2>
                  <p className="text-body-lg text-text-secondary max-w-[28ch] mb-8">
                    Những căn phòng được xác minh danh tính và kiểm duyệt hình ảnh chặt chẽ.
                  </p>
                  <Link to="/search" className="text-body font-semibold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1 touch-target">
                    Khám phá tất cả <ArrowRight className="w-4 h-4" weight="bold" />
                  </Link>
                </div>
              </div>
              
              {/* Right Column: Scrolling Staggered Grid */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {[
                  { id: '1', title: 'Phòng ban công thoáng Quận 10', price: '4,500,000', img: 'https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&w=600&q=80' },
                  { id: '2', title: 'Studio ngập nắng Tân Bình', price: '5,200,000', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80' },
                  { id: '3', title: 'Căn hộ mini an ninh Phú Nhuận', price: '6,000,000', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80' },
                  { id: '4', title: 'Phòng có gác lửng Quận 7', price: '3,800,000', img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80' }
                ].map((room, i) => (
                   <motion.div 
                     key={room.id}
                     initial={reduce ? false : { opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.1 }}
                     className={`flex flex-col bg-canvas rounded-bento p-2 border border-border-subtle shadow-xs hover:shadow-sm transition-shadow group ${i % 2 === 1 ? 'sm:mt-24' : ''}`}
                   >
                     <div className="relative aspect-[4/5] rounded-md overflow-hidden bg-surface-alt">
                        <img src={room.img} alt={room.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     </div>
                     <div className="p-5 flex flex-col gap-2 flex-1">
                        <h3 className="text-h3 text-text-primary leading-tight line-clamp-2">{room.title}</h3>
                        <p className="text-h3 text-primary mt-1">{room.price}₫<span className="text-caption text-text-muted">/th.</span></p>
                        <div className="flex flex-wrap gap-2 mt-auto pt-4">
                          <span className="bg-success-soft text-success px-3 py-1.5 rounded-pill text-caption font-semibold flex items-center gap-1 border border-success-soft">
                            <ShieldCheck  className="w-4 h-4" /> Xác thực
                          </span>
                          <span className="bg-surface-alt text-text-secondary px-3 py-1.5 rounded-pill text-caption font-semibold flex items-center gap-1 border border-border-subtle">
                            <Star  className="w-4 h-4 text-warning" /> 4.9
                          </span>
                        </div>
                     </div>
                   </motion.div>
                ))}
              </div>
              
            </div>
          </div>
        </section>

        {/* BENTO GRID - True Editorial Rhythm (3 cells) */}
        <section className="bg-canvas py-24 md:py-32 px-4 sm:px-6 lg:px-8 mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:auto-rows-[400px]">
            
            {/* Cell 1 (Lilac) - 2 cols span */}
            <div className="lg:col-span-2 rounded-bento bg-lilac p-10 md:p-16 flex flex-col justify-end relative overflow-hidden group">
              <h3 className="text-[32px] md:text-[48px] font-bold text-text-primary leading-[1.1] tracking-tight max-w-lg relative z-10">
                Thuật toán ghép nối dựa trên lối sống.
              </h3>
              {/* Decorative element */}
              <div className="absolute right-[-10%] top-[-10%] w-[60%] aspect-square bg-canvas/30 rounded-pill blur-3xl opacity-50 mix-blend-overlay"></div>
            </div>
            
            {/* Cell 2 (Mint) - 1 col span */}
            <div className="lg:col-span-1 rounded-bento bg-mint p-10 flex flex-col justify-between group">
              <div className="w-14 h-14 bg-canvas rounded-pill flex items-center justify-center shadow-xs">
                <Sparkle className="w-7 h-7 text-primary"  />
              </div>
              <div>
                <h3 className="text-h2 font-bold text-text-primary leading-tight mb-2">Thông minh.</h3>
                <p className="text-body text-text-secondary">AI phân tích 20+ điểm dữ liệu hành vi để tìm người ở ghép phù hợp nhất.</p>
              </div>
            </div>

            {/* Cell 3 (Peach) - 3 cols span wide */}
            <div className="lg:col-span-3 rounded-bento bg-peach p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
              <div className="max-w-xl">
                <h3 className="text-[32px] md:text-[40px] font-bold text-text-primary leading-[1.1] tracking-tight mb-4">
                  Một cộng đồng an toàn và minh bạch.
                </h3>
                <p className="text-body-lg text-text-secondary">
                  Gia nhập cùng 50,000+ sinh viên đang tận hưởng không gian sống chất lượng cao.
                </p>
              </div>
              <Link to="/auth" className="btn-secondary bg-canvas border-none shadow-xs whitespace-nowrap px-8">
                Bắt đầu ngay
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-surface py-16 border-t border-border-subtle">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border-subtle pb-12 mb-8">
            <Link to="/" className="text-[24px] font-black tracking-widest text-text-primary">
              DORMI<span className="text-primary">.</span>
            </Link>
            <div className="flex gap-6">
              <Link to="#" className="text-body font-medium text-text-secondary hover:text-text-primary transition-colors touch-target">Về chúng tôi</Link>
              <Link to="#" className="text-body font-medium text-text-secondary hover:text-text-primary transition-colors touch-target">Dành cho chủ nhà</Link>
              <Link to="#" className="text-body font-medium text-text-secondary hover:text-text-primary transition-colors touch-target">Hỗ trợ</Link>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-caption text-text-muted font-medium">
            <p>Bản quyền © 2026 Dormi. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4">
              <Link to="#" className="hover:text-text-primary transition-colors">Chính sách bảo mật</Link>
              <Link to="#" className="hover:text-text-primary transition-colors">Điều khoản dịch vụ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
