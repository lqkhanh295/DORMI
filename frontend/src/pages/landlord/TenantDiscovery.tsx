import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { landlordApi } from '../../services/api';
import { Users, MapPin, DollarSign, Star, MessageSquare, Check } from 'lucide-react';

export default function TenantDiscovery() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    landlordApi.discoverTenants()
      .then(res => {
        if (Array.isArray(res)) setTenants(res);
      })
      .catch(err => console.warn('Failed to load discover tenants:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = (tenant: any) => {
    navigate('/landlord/chat', {
      state: {
        targetUserId: tenant.id,
        targetUserName: tenant.fullName,
        targetUserRole: 'Tenant'
      }
    });
  };

  return (
    <div className="space-y-6 bg-[#F5F7FA]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
            <Users className="w-8 h-8 text-[#2563EB]" />
            Khám phá khách thuê phù hợp
          </h1>
          <p className="text-body text-[#64748B]">
            Danh sách người tìm phòng thực tế trên hệ thống kèm lối sống và đánh giá uy tín từ các chủ trọ trước.
          </p>
        </div>
        <span className="text-caption font-semibold bg-white px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-700 shadow-sm">
          {tenants.length} người đang tìm phòng
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#64748B]">Đang tìm kiếm hồ sơ khách thuê...</div>
      ) : tenants.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] bg-white rounded-2xl border border-dashed border-slate-200">
          Hiện tại chưa có người thuê nào kích hoạt trạng thái tìm phòng.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenants.map(tenant => {
            const habits = tenant.lifestyle 
              ? tenant.lifestyle.split(',').map((s: string) => s.trim()) 
              : ['Sạch sẽ', 'Lịch sự'];

            return (
              <Card 
                key={tenant.id} 
                className="bg-white rounded-[18px] shadow-clay-soft p-6 border-none hover:-translate-y-[2px] transition-all space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {tenant.avatarUrl ? (
                      <img 
                        src={tenant.avatarUrl} 
                        alt={tenant.fullName} 
                        className="w-14 h-14 rounded-full object-cover border border-slate-200" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-h3 font-bold">
                        {tenant.fullName?.charAt(0) || 'K'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-h3 font-bold text-[#0F172A] flex items-center gap-1.5">
                        {tenant.fullName}
                        {tenant.isVerified && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Đã xác minh</span>
                          </span>
                        )}
                      </h3>
                      <p className="text-caption text-[#64748B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {tenant.preferredLocation || tenant.preferences || 'TP. Hồ Chí Minh'}
                      </p>
                    </div>
                  </div>

                  {tenant.reputationRating > 0 ? (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-caption font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {tenant.reputationRating.toFixed(1)} ({tenant.reviewCount} lượt đánh giá)
                    </span>
                  ) : (
                    <span className="bg-blue-50 text-[#2563EB] border border-blue-100 text-caption font-semibold px-2.5 py-1 rounded-full">
                      Khách mới
                    </span>
                  )}
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-[12px] text-caption space-y-1 border border-slate-100">
                  <span className="text-[#64748B] block font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Ngân sách thuê dự kiến:
                  </span>
                  <span className="text-[#0F172A] font-bold text-body">
                    {tenant.budget ? `${Number(tenant.budget).toLocaleString('vi-VN')} đ/tháng` : 'Thỏa thuận'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-caption font-semibold text-[#64748B] block">Đặc điểm sinh hoạt:</span>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {habits.map((h: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-full text-caption font-medium shadow-xs"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={() => handleInvite(tenant)}
                    className="flex items-center gap-1.5 shadow-clay-soft"
                  >
                    <MessageSquare className="w-4 h-4" /> Mời xem phòng
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
