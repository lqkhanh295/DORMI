import { Clock, MapPin, Phone } from '@phosphor-icons/react';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassCard } from '../../components/ui/GlassCard';

export function CustomerAppointments() {
  const appointments = [
    { id: 1, title: 'Xem phòng KTX Sleepbox', date: 'Hôm nay, 14:00', location: '123 D5, Bình Thạnh', landlord: 'Cô Hoa', phone: '090xxxxxxx', status: 'Sắp diễn ra' },
    { id: 2, title: 'Xem căn hộ Studio', date: 'Ngày mai, 09:00', location: '45 Nguyễn Hữu Cảnh, Quận 1', landlord: 'Anh Tuấn', phone: '091xxxxxxx', status: 'Chờ xác nhận' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <p className="eyebrow mb-2">Lịch xem phòng</p>
        <h1 className="text-3xl font-extrabold">Quản lý lịch hẹn</h1>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <GlassCard key={appointment.id} tone="solid" className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold">{appointment.title}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  appointment.status === 'Sắp diễn ra' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-muted'
                }`}>
                  {appointment.status}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-sm text-muted">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {appointment.date}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {appointment.location}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> Chủ phòng: {appointment.landlord} ({appointment.phone})</div>
              </div>
            </div>

            <div className="flex gap-2">
              <GlassButton variant="secondary" size="sm">Hủy lịch</GlassButton>
              <GlassButton size="sm">Nhắn tin</GlassButton>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
