import { CalendarBlank as Calendar, Eye, House as Home, ChatText as MessageSquare, Plus, ShieldCheck } from '@phosphor-icons/react';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';

const rooms = [
  { title: 'Studio Nguyễn Hữu Cảnh', status: 'Đang hiển thị', views: 128, price: '5.000.000đ' },
  { title: 'Phòng ban công Quận 7', status: 'Chờ duyệt', views: 42, price: '2.500.000đ' },
];

export function LandlordDashboard() {
  const stats = [
    { title: 'Tổng số phòng', value: '5', icon: <Home className="w-6 h-6 text-primary" /> },
    { title: 'Lượt xem tháng này', value: '128', icon: <Eye className="w-6 h-6 text-emerald-600" /> },
    { title: 'Lịch hẹn mới', value: '3', icon: <Calendar className="w-6 h-6 text-amber-600" /> },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <GlassCard tone="solid" className="flex flex-col gap-4 bg-contrast text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Chủ phòng</p>
          <h1 className="text-3xl font-extrabold">Quản lý phòng và lịch xem trong một nơi</h1>
          <p className="mt-2 text-white/65">Theo dõi trạng thái duyệt, lượt xem và tin nhắn từ khách thuê.</p>
        </div>
        <GlassButton className="bg-cyan-100 text-contrast hover:bg-cyan-200 border-cyan-100" leftIcon={<Plus className="w-4 h-4" />}>
          Đăng phòng mới
        </GlassButton>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <GlassCard key={stat.title} tone="solid" className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100/70">{stat.icon}</div>
            <div>
              <p className="text-sm font-semibold text-muted">{stat.title}</p>
              <p className="text-3xl font-extrabold">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard tone="solid">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Phòng gần đây</h2>
          <GlassButton variant="secondary" size="sm">Xem tất cả</GlassButton>
        </div>
        <div className="overflow-hidden rounded-xl border border-line">
          {rooms.map((room) => (
            <div key={room.title} className="grid gap-3 border-b border-line p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <div>
                <p className="font-bold">{room.title}</p>
                <p className="text-sm text-muted">{room.price}/tháng</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${room.status === 'Đang hiển thị' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {room.status}
              </span>
              <span className="text-sm font-semibold text-muted">{room.views} lượt xem</span>
              <GlassButton variant="secondary" size="sm">Quản lý</GlassButton>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export function KYC() {
  return (
    <GlassCard tone="solid" className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">Xác thực danh tính KYC</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Tải lên CCCD/CMND để tăng độ tin cậy và mở quyền đăng phòng công khai.</p>
        </div>
      </div>
      <div className="flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-primary/35 bg-cyan-50/80 text-sm font-semibold text-primary">
        Kéo thả file vào đây hoặc bấm để chọn
      </div>
      <GlassButton className="self-end">Gửi xác thực</GlassButton>
    </GlassCard>
  );
}

export function CreateRoom() {
  return (
    <GlassCard tone="solid" className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="eyebrow mb-2">Bước 1/3</p>
        <h2 className="text-xl font-extrabold">Tạo phòng mới</h2>
      </div>
      <GlassInput label="Tiêu đề bài đăng" placeholder="VD: Phòng trọ ban công gần đại học..." />
      <div className="grid gap-5 md:grid-cols-2">
        <GlassInput label="Giá tiền (VNĐ)" type="number" placeholder="3000000" />
        <GlassInput label="Diện tích" placeholder="24m²" />
      </div>
      <GlassInput label="Địa chỉ" placeholder="Số nhà, tên đường, phường/xã..." />
      <div className="flex justify-between pt-2">
        <GlassButton variant="secondary">Hủy</GlassButton>
        <GlassButton>Tiếp tục</GlassButton>
      </div>
    </GlassCard>
  );
}

export function MyRooms() {
  return (
    <GlassCard tone="solid">
      <h2 className="mb-4 text-xl font-extrabold">Phòng của tôi</h2>
      <div className="grid gap-3">
        {rooms.map((room) => (
          <div key={room.title} className="flex flex-col justify-between gap-3 rounded-xl border border-line p-4 md:flex-row md:items-center">
            <div>
              <p className="font-bold">{room.title}</p>
              <p className="text-sm text-muted">{room.price}/tháng</p>
            </div>
            <GlassButton variant="secondary" size="sm">Chỉnh sửa</GlassButton>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function LandlordAppointments() {
  return (
    <GlassCard tone="solid">
      <h2 className="mb-4 text-xl font-extrabold">Lịch hẹn xem phòng</h2>
      <div className="rounded-xl border border-line p-4">
        <p className="font-bold">Trần Văn Khách - Studio Nguyễn Hữu Cảnh</p>
        <p className="mt-1 text-sm text-muted">Hôm nay, 17:30. Cần xác nhận trước 15:00.</p>
      </div>
    </GlassCard>
  );
}

export function LandlordMessages() {
  return (
    <GlassCard tone="solid" className="flex flex-col items-center justify-center py-16 text-center">
      <MessageSquare className="mb-4 h-10 w-10 text-primary" />
      <h2 className="mb-2 text-xl font-extrabold">Tin nhắn từ khách thuê</h2>
      <p className="max-w-md text-muted">Danh sách hội thoại sẽ hiển thị ở đây khi khách thuê liên hệ về phòng của bạn.</p>
    </GlassCard>
  );
}
