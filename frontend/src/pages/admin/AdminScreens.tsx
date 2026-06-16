import { AlertTriangle, Check, FileCheck, Shield, Users, X } from 'lucide-react';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';

const reviewItems = [
  { title: 'Studio Nguyễn Hữu Cảnh', owner: 'Nguyễn Văn Chủ', status: 'Chờ duyệt', risk: 'Thấp' },
  { title: 'Phòng ban công Quận 7', owner: 'Lê Minh Hoa', status: 'Cần kiểm tra ảnh', risk: 'Trung bình' },
];

export function AdminDashboard() {
  const stats = [
    { title: 'Người dùng', value: '1,204', icon: <Users className="w-6 h-6 text-primary" /> },
    { title: 'Phòng chờ duyệt', value: '15', icon: <Shield className="w-6 h-6 text-amber-600" /> },
    { title: 'Báo cáo mở', value: '2', icon: <AlertTriangle className="w-6 h-6 text-red-500" /> },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <GlassCard key={stat.title} tone="solid" className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">{stat.icon}</div>
            <div>
              <p className="text-sm font-semibold text-muted">{stat.title}</p>
              <p className="text-3xl font-extrabold">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <AdminRooms />
    </div>
  );
}

export function AdminRooms() {
  return (
    <GlassCard tone="solid">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-2">Kiểm duyệt</p>
          <h2 className="text-xl font-extrabold">Bài đăng phòng chờ duyệt</h2>
        </div>
        <GlassButton variant="secondary" size="sm">Lọc ưu tiên</GlassButton>
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        {reviewItems.map((item) => (
          <div key={item.title} className="grid gap-3 border-b border-line p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm text-muted">Chủ phòng: {item.owner}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item.status}</span>
            <span className="text-sm font-semibold text-muted">Rủi ro: {item.risk}</span>
            <div className="flex gap-2">
              <GlassButton size="sm" leftIcon={<Check className="w-4 h-4" />}>Duyệt</GlassButton>
              <GlassButton variant="secondary" size="sm" leftIcon={<X className="w-4 h-4" />}>Từ chối</GlassButton>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function AdminUsers() {
  return (
    <GlassCard tone="solid">
      <h2 className="mb-4 text-xl font-extrabold">Quản lý người dùng</h2>
      <p className="text-muted">Danh sách khách thuê và chủ phòng sẽ hiển thị theo trạng thái xác minh, hoạt động và báo cáo.</p>
    </GlassCard>
  );
}

export function AdminReports() {
  return (
    <GlassCard tone="solid">
      <h2 className="mb-4 text-xl font-extrabold">Báo cáo gian lận</h2>
      <p className="text-muted">Theo dõi báo cáo từ người dùng về tin giả, chủ phòng lừa đảo hoặc nội dung không phù hợp.</p>
    </GlassCard>
  );
}

export function AdminKYC() {
  return (
    <GlassCard tone="solid">
      <div className="mb-4 flex items-center gap-3">
        <FileCheck className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-extrabold">Duyệt KYC</h2>
      </div>
      <p className="text-muted">Kiểm tra giấy tờ tùy thân của chủ phòng trước khi cho phép đăng bài công khai.</p>
    </GlassCard>
  );
}
