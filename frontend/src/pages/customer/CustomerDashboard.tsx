import { Link } from 'react-router-dom';
import { Calendar, Clock, Heart, MessageSquare, Search, Sparkles } from 'lucide-react';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';

export function CustomerDashboard() {
  const stats = [
    { title: 'Phòng đã lưu', value: '12', icon: <Heart className="w-6 h-6 text-rose-500" /> },
    { title: 'Lịch hẹn sắp tới', value: '2', icon: <Calendar className="w-6 h-6 text-primary" /> },
    { title: 'Tin nhắn chưa đọc', value: '5', icon: <MessageSquare className="w-6 h-6 text-emerald-500" /> },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <GlassCard tone="solid" className="flex flex-col gap-5 bg-contrast text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Hôm nay</p>
          <h1 className="text-3xl font-extrabold">Bạn có 2 lịch xem phòng cần xác nhận</h1>
          <p className="mt-2 text-white/65">Kiểm tra lịch hẹn, nhắn chủ phòng và tiếp tục lọc phòng gần trường.</p>
        </div>
        <Link to="/customer/search">
          <GlassButton className="bg-cyan-100 text-contrast hover:bg-cyan-200 border-cyan-100" leftIcon={<Search className="w-4 h-4" />}>
            Tìm thêm phòng
          </GlassButton>
        </Link>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <GlassCard key={stat.title} tone="solid" className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100/70">
              {stat.icon}
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-muted">{stat.title}</p>
              <h3 className="text-3xl font-extrabold text-foreground">{stat.value}</h3>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard tone="solid" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Lịch hẹn sắp tới</h3>
            <Link to="/customer/appointments" className="text-sm font-semibold text-primary hover:underline">Xem tất cả</Link>
          </div>
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-cyan-50/70 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">Xem phòng KTX Sleepbox</h4>
                  <p className="text-sm text-muted">Hôm nay, 14:00 - Bình Thạnh</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Sắp diễn ra</span>
            </div>
          ))}
        </GlassCard>

        <GlassCard tone="solid" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Gợi ý bạn cùng phòng</h3>
            <Link to="/customer/matcher" className="text-sm font-semibold text-primary hover:underline">Tìm thêm</Link>
          </div>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center gap-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${item}`} alt="Bạn cùng phòng" className="h-12 w-12 rounded-full bg-slate-100" />
                <div>
                  <h4 className="font-bold">Nguyễn Văn A</h4>
                  <p className="text-sm text-muted">Sinh viên năm 2 - gọn gàng, không hút thuốc</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" /> 95%
              </span>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}
