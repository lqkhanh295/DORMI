import React from 'react';
import { ArrowRight, Search, Shield, Users, MapPin, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/40 text-primary font-medium mb-8 shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Nền tảng tìm phòng & ghép phòng 3D hàng đầu
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
          Tìm phòng trọ, <br className="hidden md:block" />
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Chọn người ở ghép</span> dễ dàng
        </h1>
        
        <p className="text-xl text-foreground/70 max-w-2xl mb-10 leading-relaxed">
          DORMI kết nối bạn với những căn phòng lý tưởng qua trải nghiệm Virtual 3D chân thực, cùng thuật toán AI ghép người ở ghép hoàn hảo.
        </p>

        <GlassCard className="w-full max-w-3xl p-4 flex flex-col md:flex-row gap-4 items-end shadow-xl border-white/60">
          <div className="flex-1 w-full">
            <GlassInput 
              placeholder="Nhập khu vực, trường đại học..." 
              leftIcon={<Search className="w-5 h-5" />}
              className="bg-white/80 border-white/60 focus:bg-white"
            />
          </div>
          <Link to="/search" className="w-full md:w-auto">
            <GlassButton size="lg" className="w-full md:w-auto group">
              Tìm kiếm ngay <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </GlassButton>
          </Link>
        </GlassCard>
      </section>

      {/* Bento Grid: Featured Rooms */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Phòng Hot Hôm Nay</h2>
          <Link to="/search" className="text-primary font-medium hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          {/* Căn Hot Nhất - Chiếm không gian lớn */}
          <GlassCard className="col-span-1 md:col-span-2 md:row-span-2 !p-0 group cursor-pointer overflow-hidden border-white/50">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Hot room" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">Có Virtual 3D</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold rounded-full">Quận 1</span>
              </div>
              <h3 className="text-white text-3xl font-bold mb-1">Căn Hộ Studio Cao Cấp</h3>
              <p className="text-white/80 font-medium">5.000.000đ / tháng</p>
            </div>
          </GlassCard>

          {/* Các căn nhỏ hơn */}
          <GlassCard className="col-span-1 md:col-span-1 md:row-span-1 !p-0 group cursor-pointer overflow-hidden">
            <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Room 2" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-bold">KTX Sleepbox</h3>
              <p className="text-white/80 text-sm">1.800.000đ - Bình Thạnh</p>
            </div>
          </GlassCard>

          <GlassCard className="col-span-1 md:col-span-1 md:row-span-1 !p-0 group cursor-pointer overflow-hidden">
            <img src="https://images.unsplash.com/photo-1502672260266-1c1e5250base?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Room 3" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-bold">Phòng ban công</h3>
              <p className="text-white/80 text-sm">2.500.000đ - Quận 7</p>
            </div>
          </GlassCard>

          {/* Thẻ hiển thị Statistic / Component tìm Roommate */}
          <GlassCard className="col-span-1 md:col-span-2 md:row-span-1 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-200/50 flex flex-col items-center justify-center text-center p-6 group cursor-pointer hover:bg-blue-500/30 transition-colors">
            <Sparkles className="w-10 h-10 text-primary mb-3 group-hover:animate-spin" />
            <h3 className="text-xl font-bold text-foreground mb-1">Đang tìm bạn ở ghép?</h3>
            <p className="text-foreground/70 mb-3">AI Matcher sẽ giúp bạn tìm người phù hợp nhất.</p>
            <span className="font-bold text-primary underline decoration-2 underline-offset-4">Trải nghiệm ngay</span>
          </GlassCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        <GlassCard className="flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-2xl bg-blue-100/50 flex items-center justify-center text-primary shadow-inner">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Xem phòng Virtual 3D</h3>
          <p className="text-foreground/70">Khám phá mọi góc độ của căn phòng mà không cần đến tận nơi.</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-100/50 flex items-center justify-center text-amber-500 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">AI Ghép bạn cùng phòng</h3>
          <p className="text-foreground/70">Thuật toán thông minh giúp tìm người ở ghép phù hợp lối sống.</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100/50 flex items-center justify-center text-emerald-500 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">KYC Xác thực danh tính</h3>
          <p className="text-foreground/70">Tất cả chủ trọ và người dùng đều được xác minh rõ ràng, an toàn.</p>
        </GlassCard>
      </section>
    </div>
  );
}
