import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Clock, MapPin, Phone } from 'lucide-react';
import { GlassButton } from '../../components/ui/GlassButton';

export function CustomerAppointments() {
  const appointments = [
    { id: 1, title: 'Xem phòng KTX Sleepbox', date: 'Hôm nay, 14:00', location: '123 D5, Bình Thạnh', landlord: 'Cô Hoa', phone: '090xxxxxxx', status: 'Sắp diễn ra' },
    { id: 2, title: 'Xem Căn hộ Studio', date: 'Ngày mai, 09:00', location: '45 Nguyễn Hữu Cảnh, Quận 1', landlord: 'Anh Tuấn', phone: '091xxxxxxx', status: 'Chờ xác nhận' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold">Lịch hẹn xem phòng</h2>
      
      <div className="grid gap-4">
        {appointments.map(apt => (
          <GlassCard key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-lg">{apt.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${apt.status === 'Sắp diễn ra' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {apt.status}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 text-sm text-foreground/70">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {apt.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {apt.location}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Chủ trọ: {apt.landlord} ({apt.phone})
                </div>
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
