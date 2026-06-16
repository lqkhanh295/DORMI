import React from 'react';
import { ArrowRight, Search, Shield, Users } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassInput } from '../components/ui/GlassInput';
import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/40 text-primary font-medium mb-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Nền tảng tìm phòng & ghép phòng 3D
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight mb-6">
          Tìm phòng trọ, <br className="hidden md:block" />
          <span className="text-primary">Chọn người ở ghép</span> dễ dàng
        </h1>
        
        <p className="text-xl text-foreground/70 max-w-2xl mb-10">
          DORMI kết nối bạn với những căn phòng lý tưởng qua trải nghiệm Virtual 3D chân thực, cùng thuật toán ghép người ở ghép hoàn hảo.
        </p>

        <GlassCard className="w-full max-w-3xl p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <GlassInput 
              placeholder="Nhập khu vực, trường đại học..." 
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <Link to="/search" className="w-full md:w-auto">
            <GlassButton size="lg" className="w-full">
              Tìm kiếm ngay
            </GlassButton>
          </Link>
        </GlassCard>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        <GlassCard className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100/50 flex items-center justify-center text-primary">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Xem phòng Virtual 3D</h3>
          <p className="text-foreground/70">Khám phá mọi góc độ của căn phòng mà không cần đến tận nơi.</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100/50 flex items-center justify-center text-amber-500">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">AI Ghép bạn cùng phòng</h3>
          <p className="text-foreground/70">Thuật toán thông minh giúp tìm người ở ghép phù hợp lối sống.</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100/50 flex items-center justify-center text-emerald-500">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">KYC Xác thực danh tính</h3>
          <p className="text-foreground/70">Tất cả chủ trọ và người dùng đều được xác minh rõ ràng, an toàn.</p>
        </GlassCard>
      </section>
    </div>
  );
}
