import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { landlordApi, roomsApi, type RoomResponse, type TenantDiscoveryCandidate } from '../../services/api';
import { Users, MapPin, DollarSign, Star, MessageSquare, Check, X, Send, Home, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantDiscovery() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantDiscoveryCandidate[]>([]);
  const [myRooms, setMyRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [minScore, setMinScore] = useState<number>(0);
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Invite modal states
  const [selectedTenant, setSelectedTenant] = useState<TenantDiscoveryCandidate | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [inviteMessage, setInviteMessage] = useState<string>('');
  const [inviting, setInviting] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      landlordApi.discoverTenants(),
      roomsApi.getRooms({ page: 1, pageSize: 50 })
    ])
      .then(([tenantsRes, roomsRes]) => {
        if (tenantsRes.status === 'fulfilled' && Array.isArray(tenantsRes.value)) {
          setTenants(tenantsRes.value);
        }
        if (roomsRes.status === 'fulfilled' && roomsRes.value?.data) {
          setMyRooms(roomsRes.value.data);
          if (roomsRes.value.data.length > 0) {
            setSelectedRoomId(roomsRes.value.data[0].id);
          }
        }
      })
      .catch(err => console.warn('Failed to load discover data:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTenants = tenants.filter(t => {
    if (minScore > 0 && t.matchScore < minScore) return false;
    if (onlyVerified && !t.isVerified) return false;
    if (searchLocation.trim()) {
      const q = searchLocation.trim().toLowerCase();
      const loc = (t.preferredLocation || t.preferences || '').toLowerCase();
      if (!loc.includes(q)) return false;
    }
    return true;
  });

  const handleOpenInviteModal = (tenant: TenantDiscoveryCandidate) => {
    setSelectedTenant(tenant);
    setInviteMessage(`Chào ${tenant.fullName}, mình thấy nhu cầu tìm phòng của bạn rất phù hợp với căn phòng này. Mời bạn xem chi tiết và hẹn lịch xem phòng trực tiếp nhé!`);
  };

  const handleSendInvite = async () => {
    if (!selectedTenant) return;
    if (!selectedRoomId) {
      toast.error('Vui lòng chọn phòng trọ để gửi lời mời.');
      return;
    }

    try {
      setInviting(true);
      await landlordApi.inviteTenantToRoom({
        tenantId: selectedTenant.id,
        roomId: selectedRoomId,
        message: inviteMessage
      });
      toast.success(`Đã gửi lời mời xem phòng đến ${selectedTenant.fullName}!`);
      
      const targetUserId = selectedTenant.id;
      const targetUserName = selectedTenant.fullName;
      setSelectedTenant(null);

      // Navigate to chat
      navigate('/landlord/chat', {
        state: {
          targetUserId,
          targetUserName,
          targetUserRole: 'Tenant'
        }
      });
    } catch (err: any) {
      toast.error(err?.message || 'Gửi lời mời thất bại. Vui lòng thử lại.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6 bg-[#F5F7FA]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
            <Users className="w-8 h-8 text-[#2563EB]" />
            Khám phá khách thuê phù hợp (Tenant Discovery)
          </h1>
          <p className="text-body text-[#64748B]">
            Dựa trên phân tích tiêu chí tìm phòng, ngân sách, lối sống và điểm uy tín người thuê trên hệ thống.
          </p>
        </div>
        <span className="text-caption font-semibold bg-white px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-700 shadow-sm self-start sm:self-auto">
          {filteredTenants.length} / {tenants.length} người phù hợp
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-[18px] shadow-clay-soft p-4 flex flex-wrap items-center justify-between gap-4 border-none">
        <div className="flex flex-wrap items-center gap-3">
          {/* Location search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Lọc theo khu vực (Quận 1, Q10, RMIT...)"
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-64 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00153D]"
            />
          </div>

          {/* Match score filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Độ tương thích:</span>
            <select
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
            >
              <option value={0}>Tất cả điểm số</option>
              <option value={75}>Từ 75% trở lên</option>
              <option value={85}>Từ 85% trở lên (Cao)</option>
              <option value={90}>Từ 90% trở lên (Rất cao)</option>
            </select>
          </div>
        </div>

        {/* Verified CCCD checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={e => setOnlyVerified(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Chỉ khách đã xác thực CCCD</span>
        </label>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#64748B]">Đang tìm kiếm hồ sơ khách thuê...</div>
      ) : filteredTenants.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] bg-white rounded-2xl border border-dashed border-slate-200">
          Không tìm thấy khách thuê nào thỏa mãn bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTenants.map(tenant => {
            const habits = tenant.lifestyle 
              ? tenant.lifestyle.split(',').map((s: string) => s.trim()) 
              : ['Sạch sẽ', 'Lịch sự'];

            return (
              <Card 
                key={tenant.id} 
                className="bg-white rounded-[18px] shadow-clay-soft p-6 border-none hover:-translate-y-[2px] hover:shadow-clay-primary transition-[transform,box-shadow] duration-200 ease-out space-y-4"
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
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
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

                  <div className="flex flex-col items-end gap-1">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-caption font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      {tenant.matchScore}% Phù hợp
                    </span>

                    {tenant.reputationRating > 0 && (
                      <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {tenant.reputationRating.toFixed(1)} Điểm uy tín
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-[12px] text-caption space-y-1 border border-slate-100">
                  <span className="text-[#64748B] block font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Ngân sách & Tiêu chí:
                  </span>
                  <p className="text-[#0F172A] font-bold text-body">
                    {tenant.budgetRange || '2.5 - 4.5 triệu/tháng'}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {tenant.preferences || 'Giờ giấc tự do, an ninh, phòng sạch sẽ'}
                  </p>
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
                    onClick={() => handleOpenInviteModal(tenant)}
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

      {/* INVITE TENANT MODAL */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Mời khách thuê xem phòng</h3>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                {selectedTenant.avatarUrl ? (
                  <img src={selectedTenant.avatarUrl} alt={selectedTenant.fullName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {selectedTenant.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedTenant.fullName}</h4>
                  <p className="text-slate-500">Độ tương thích: <span className="font-bold text-blue-600">{selectedTenant.matchScore}%</span> · Ngân sách: {selectedTenant.budgetRange}</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Chọn phòng trọ bạn muốn giới thiệu:
                </label>
                {myRooms.length > 0 ? (
                  <select
                    value={selectedRoomId}
                    onChange={e => setSelectedRoomId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    {myRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.title} - {Number(room.price).toLocaleString('vi-VN')}đ/tháng ({room.address})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-rose-600 italic">Bạn chưa có phòng trọ nào còn trống để gửi lời mời.</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Lời nhắn gửi kèm:
                </label>
                <textarea
                  rows={4}
                  value={inviteMessage}
                  onChange={e => setInviteMessage(e.target.value)}
                  placeholder="Ghi lời nhắn mời khách thuê..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                disabled={inviting}
                onClick={() => setSelectedTenant(null)}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                disabled={inviting || !selectedRoomId}
                onClick={handleSendInvite}
                className="flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                {inviting ? 'Đang gửi...' : 'Gửi lời mời & Mở Chat'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
