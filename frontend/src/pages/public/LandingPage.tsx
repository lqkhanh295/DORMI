import { GlobalNav } from '../../components/ui/GlobalNav';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkle, Star, GraduationCap } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'framer-motion';

// Spring configurations
const springHover = { type: "spring" as const, stiffness: 500, damping: 35 };

export default function LandingPage() {
  const reduce = useReducedMotion();

  // Reveal variants
  const revealVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-canvas min-h-screen text-text-primary overflow-x-hidden">
      <GlobalNav />
      
      <main className="space-y-0">
        
        {/* 1. HERO SECTION - Editorial Split Screen */}
        <section className="relative w-full mx-auto max-w-[1400px] min-h-[90dvh] pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Razor-Sharp Editorial Typography */}
          <div className="flex-1 max-w-xl z-10 w-full pt-8 lg:pt-0">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <h1 className="text-[54px] md:text-[72px] lg:text-[88px] font-bold text-text-primary leading-[1.02] tracking-tighter">
                Không gian sống.<br />
                Được kiểm duyệt.
              </h1>
              
              <p className="text-body-lg text-text-secondary max-w-[32ch]">
                Tìm phòng trọ an toàn và đối tác ở ghép lý tưởng dựa trên công nghệ xác thực AI dành riêng cho sinh viên.
              </p>

              <div className="pt-2">
                <Link to="/search" className="btn-spatial shadow-xs group">
                  Khám phá phòng trọ
                  <motion.span 
                    className="inline-block ml-2"
                    transition={springHover}
                    whileHover={{ x: 4 }}
                  >
                    <ArrowRight className="w-5 h-5" weight="bold" />
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Large Photo with Clip path entry & Hover effect */}
          <div className="flex-1 w-full relative h-[50vh] lg:h-[75vh] flex items-center justify-center">
            <motion.div 
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="w-full h-full rounded-bento overflow-hidden bg-surface-alt border border-border-subtle relative group shadow-xs"
            >
              <img 
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop" 
                alt="Không gian căn hộ hiện đại tại Quận 10" 
                className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700"
              />
              
              {/* Architectural Label / Minimalist Caption */}
              <div className="absolute bottom-6 left-6 bg-canvas/90 border border-border-subtle px-4 py-2 rounded-md shadow-xs z-20 backdrop-blur-xs flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-caption font-bold text-text-primary">Studio C102</span>
                  <span className="text-[11px] text-text-secondary font-semibold">Quận 10, TP. Hồ Chí Minh</span>
                </div>
                <div className="w-[1px] h-6 bg-border-subtle"></div>
                <span className="bg-success-soft text-success text-[11px] font-bold px-2 py-0.5 rounded-pill flex items-center gap-1 border border-success-soft">
                  <ShieldCheck  className="w-3.5 h-3.5" /> Đã xác minh
                </span>
              </div>
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-text-muted">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Cuộn xuống</span>
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-pill border-2 border-border-subtle flex justify-center pt-1"
            >
              <div className="w-1.5 h-1.5 bg-text-muted rounded-pill"></div>
            </motion.div>
          </div>
        </section>

        {/* 2. UNIVERSITY MARQUEE (Social Proof Wall under Hero) */}
        <section className="bg-canvas border-y border-border-subtle py-8 overflow-hidden select-none">
          <div className="flex w-max gap-12 items-center animate-infinite-scroll">
            {/* Double the university names to make seamless scroll loop */}
            {[
              'Đại học Bách Khoa', 'Đại học Ngoại Thương', 'Đại học Kinh tế UEH', 'Đại học RMIT', 'Đại học HUTECH', 'Đại học Quốc Gia', 'Đại học Y Dược',
              'Đại học Bách Khoa', 'Đại học Ngoại Thương', 'Đại học Kinh tế UEH', 'Đại học RMIT', 'Đại học HUTECH', 'Đại học Quốc Gia', 'Đại học Y Dược'
            ].map((uni, idx) => (
              <div key={idx} className="flex items-center gap-3 text-text-secondary font-semibold text-body-lg whitespace-nowrap">
                <GraduationCap className="w-6 h-6 text-primary"  />
                <span>{uni}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. IMPACT STATS ROW (Asymmetric Editorial Layout) */}
        <section className="bg-canvas py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-[1400px]">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-border-subtle pb-20"
          >
            <motion.div variants={revealVariants} className="space-y-2">
              <p className="text-[64px] font-bold text-text-primary leading-none tracking-tight">12K+</p>
              <p className="text-h3 font-bold text-text-primary">Phòng trọ xác thực</p>
              <p className="text-body text-text-secondary">Được kiểm duyệt hình ảnh và thông tin chi tiết bằng hệ thống AI tiên tiến.</p>
            </motion.div>
            <motion.div variants={revealVariants} className="space-y-2">
              <p className="text-[64px] font-bold text-text-primary leading-none tracking-tight">95%</p>
              <p className="text-h3 font-bold text-text-primary">Tỉ lệ ở ghép thành công</p>
              <p className="text-body text-text-secondary">Tìm đúng bạn cùng phòng phù hợp phong cách sống, giờ giấc sinh hoạt.</p>
            </motion.div>
            <motion.div variants={revealVariants} className="space-y-2">
              <p className="text-[64px] font-bold text-text-primary leading-none tracking-tight">0%</p>
              <p className="text-h3 font-bold text-text-primary">Rủi ro đặt cọc</p>
              <p className="text-body text-text-secondary">Toàn bộ hợp đồng và lịch hẹn đặt cọc đều được ghi nhận minh bạch.</p>
            </motion.div>
          </motion.div>
        </section>

        {/* 4. HOW IT WORKS (Step-by-step Narrative Flow) */}
        <section className="bg-canvas py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Sticky left introduction */}
            <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-6">
                <h2 className="text-[40px] md:text-[54px] font-bold text-text-primary leading-[1.05] tracking-tight">
                  Quy trình tìm phòng đơn giản.
                </h2>
                <p className="text-body-lg text-text-secondary max-w-[28ch]">
                  Chúng tôi số hóa quy trình tìm trọ truyền thống để đem lại trải nghiệm thuê trọ trơn tru nhất cho sinh viên.
                </p>
              </div>
            </div>

            {/* Right steps list with staggered reveal */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-7 space-y-12"
            >
              {[
                { step: '01', title: 'Chọn khu vực & ngân sách', desc: 'Sử dụng bản đồ và các bộ lọc thông minh để khoanh vùng các căn phòng lý tưởng gần trường học của bạn.' },
                { step: '02', title: 'AI gợi ý bạn ở ghép', desc: 'Điền khảo sát thói quen sinh hoạt (giờ giấc, thú cưng, hút thuốc) để hệ thống tự động kết nối đối tác tương thích.' },
                { step: '03', title: 'Đặt lịch xem trọ thực tế', desc: 'Lên lịch hẹn xem phòng trực tiếp với chủ trọ đã xác thực chỉ với vài click chuột.' },
                { step: '04', title: 'Ký hợp đồng an toàn', desc: 'Thực hiện đặt cọc và xác nhận hợp đồng điện tử minh bạch, cam kết giữ phòng đúng thỏa thuận.' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={revealVariants}
                  className="flex gap-6 pb-8 border-b border-border-subtle last:border-none"
                >
                  <span className="text-h2 font-black text-primary/40 tracking-tight leading-none">{item.step}</span>
                  <div className="space-y-2">
                    <h3 className="text-h2 font-bold text-text-primary tracking-tight">{item.title}</h3>
                    <p className="text-body text-text-secondary leading-relaxed max-w-[50ch]">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* 5. FEATURED ROOMS - Sticky Stack / Staggered Masonry */}
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

        {/* 6. BENTO GRID - True Editorial Rhythm (3 cells) */}
        <section className="bg-canvas py-24 md:py-32 px-4 sm:px-6 lg:px-8 mx-auto max-w-[1400px]">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:auto-rows-[400px]"
          >
            {/* Cell 1 (Lilac) - 2 cols span */}
            <motion.div variants={revealVariants} className="lg:col-span-2 rounded-bento bg-lilac p-10 md:p-16 flex flex-col justify-end relative overflow-hidden group">
              <h3 className="text-[32px] md:text-[48px] font-bold text-text-primary leading-[1.1] tracking-tight max-w-lg relative z-10">
                Thuật toán ghép nối dựa trên lối sống.
              </h3>
              <div className="absolute right-[-10%] top-[-10%] w-[60%] aspect-square bg-canvas/30 rounded-full blur-3xl opacity-50 mix-blend-overlay"></div>
            </motion.div>
            
            {/* Cell 2 (Mint) - 1 col span */}
            <motion.div variants={revealVariants} className="lg:col-span-1 rounded-bento bg-mint p-10 flex flex-col justify-between group">
              <div className="w-14 h-14 bg-canvas rounded-full flex items-center justify-center shadow-xs">
                <Sparkle className="w-7 h-7 text-primary"  />
              </div>
              <div>
                <h3 className="text-h2 font-bold text-text-primary leading-tight mb-2">Thông minh.</h3>
                <p className="text-body text-text-secondary">AI phân tích 20+ điểm dữ liệu hành vi để tìm người ở ghép phù hợp nhất.</p>
              </div>
            </motion.div>

            {/* Cell 3 (Peach) - 3 cols span wide */}
            <motion.div variants={revealVariants} className="lg:col-span-3 rounded-bento bg-peach p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
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
            </motion.div>
          </motion.div>
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
