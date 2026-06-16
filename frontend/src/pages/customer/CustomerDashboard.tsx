import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Heart, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CustomerDashboard() {
  const stats = [
    { title: 'Phòng đã lưu', value: '12', icon: <Heart className="w-6 h-6 text-rose-500" /> },
    { title: 'Lịch hẹn sắp tới', value: '2', icon: <Calendar className="w-6 h-6 text-primary" /> },
    { title: 'Tin nhắn chưa đọc', value: '5', icon: <MessageSquare className="w-6 h-6 text-emerald-500" /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="flex items-center p-6 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/50 border border-white/60 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/60 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Lịch hẹn sắp tới</h3>
            <Link to="/customer/appointments" className="text-sm text-primary hover:underline">Xem tất cả</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="p-4 rounded-xl bg-white/40 border border-white/30 hover:bg-white/60 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Xem phòng KTX Sleepbox</h4>
                    <p className="text-sm text-foreground/60">Hôm nay, 14:00 - Quận Bình Thạnh</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100/80 text-amber-600 border border-amber-200/50">
                  Sắp diễn ra
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Đề xuất bạn cùng phòng (AI)</h3>
            <Link to="/customer/matcher" className="text-sm text-primary hover:underline">Tìm thêm</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl bg-white/40 border border-white/30 hover:bg-white/60 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 border border-white">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} alt="avatar" className="w-full h-full rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Nguyễn Văn A</h4>
                    <p className="text-sm text-foreground/60">Sinh viên năm 2 - Chung sở thích: Đọc sách, Im lặng</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-600 border border-emerald-200/50">
                  95% Match
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
