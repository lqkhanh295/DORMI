import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../services/api';
import { toast } from 'sonner';
import { CheckCircle2, Clock, XCircle, ShieldCheck, Mail, Phone, UserCheck, ZoomIn, Check, Globe } from 'lucide-react';

interface ModerationRoomItem {
  id: string;
  title: string;
  description?: string;
  address: string;
  price: number;
  area?: number;
  roomType?: string;
  utilities?: string;
  virtual3DUrl?: string;
  landlordName: string;
  landlordPhone?: string;
  landlordEmail?: string;
  landlordAvatarUrl?: string;
  isVerifiedLandlord?: boolean;
  status: number;
  createdAt: string;
  images?: { id: string; imageUrl: string; isPrimary: boolean }[];
}

export default function ContentModeration() {
  const [rooms, setRooms] = useState<ModerationRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | number>('all');
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRoomsForModeration();
      if (res && Array.isArray(res)) {
        setRooms(res);
        if (res.length > 0 && !selectedId) setSelectedId(res[0].id);
      }
    } catch (err) {
      console.warn('Failed to load rooms for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const filteredRooms = filterStatus === 'all'
    ? rooms
    : rooms.filter(r => r.status === filterStatus);

  const selectedRoom = rooms.find(r => r.id === selectedId);

  const handleAction = async (roomId: string, status: number) => {
    try {
      await adminApi.updateRoomStatus(roomId, status);
      toast.success('Đã cập nhật trạng thái phòng trọ thành công!');
      loadRooms();
    } catch {
      toast.error('Thao tác không thành công.');
    }
  };

  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="text-caption font-bold bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt (Công khai)</span>;
      case 2:
        return <span className="text-caption font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Chờ phê duyệt</span>;
      case 3:
        return <span className="text-caption font-bold bg-[#FEF2F2] text-[#C62828] border border-[#FECACA] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Bị từ chối / Ẩn</span>;
      case 1:
        return <span className="text-caption font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">Đã thuê</span>;
      default:
        return null;
    }
  };

  const getLandlordAvatar = (room: ModerationRoomItem) => {
    if (room.landlordAvatarUrl && room.landlordAvatarUrl.trim()) {
      return room.landlordAvatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(room.landlordName)}&background=00153D&color=fff&bold=true`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Kiểm duyệt nội dung phòng trọ (Admin Portal)</h1>
          <p className="text-body text-[#64748B]">Xem xét và phê duyệt đầy đủ thông tin tin đăng phòng trọ và chân dung chủ nhà.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-1/3 flex flex-col bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FA]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-h3 text-[#0F172A]">Danh sách tin đăng</h3>
              <span className="bg-[#EEF2F6] text-[#00153D] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full text-caption font-semibold">{filteredRooms.length} / {rooms.length}</span>
            </div>
            {/* Status Filter Tabs */}
            <div className="flex gap-1 bg-[#E2E8F0] p-1 rounded-xl text-caption font-semibold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`flex-1 py-1 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white text-[#00153D] shadow-sm' : 'text-[#64748B] hover:text-[#00153D]'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus(2)}
                className={`flex-1 py-1 rounded-lg transition-all ${filterStatus === 2 ? 'bg-amber-100 text-amber-800 shadow-sm font-bold' : 'text-[#64748B] hover:text-[#00153D]'}`}
              >
                Chờ duyệt
              </button>
              <button
                onClick={() => setFilterStatus(0)}
                className={`flex-1 py-1 rounded-lg transition-all ${filterStatus === 0 ? 'bg-emerald-100 text-emerald-800 shadow-sm font-bold' : 'text-[#64748B] hover:text-[#00153D]'}`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setFilterStatus(3)}
                className={`flex-1 py-1 rounded-lg transition-all ${filterStatus === 3 ? 'bg-rose-100 text-rose-800 shadow-sm font-bold' : 'text-[#64748B] hover:text-[#00153D]'}`}
              >
                Từ chối
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading && <div className="p-8 text-center text-[#64748B]">Đang tải danh sách phòng...</div>}
            {!loading && filteredRooms.map(room => (
              <div
                key={room.id}
                onClick={() => setSelectedId(room.id)}
                className={`p-4 rounded-[14px] cursor-pointer transition-all ${selectedId === room.id ? 'bg-white shadow-clay-primary border-2 border-[#00153D]' : 'bg-[#F5F7FA] border border-[#E2E8F0] hover:bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  {renderStatusBadge(room.status)}
                </div>
                <p className="font-semibold text-[#0F172A] text-body line-clamp-1">{room.title}</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E2E8F0]/60">
                  <img 
                    src={getLandlordAvatar(room)} 
                    alt={room.landlordName} 
                    className="w-6 h-6 rounded-full object-cover border border-[#CBD5E1]" 
                  />
                  <span className="text-caption text-[#64748B]">Chủ trọ: <strong className="text-[#0F172A]">{room.landlordName}</strong></span>
                </div>
              </div>
            ))}
            {!loading && filteredRooms.length === 0 && (
              <div className="p-8 text-center text-[#64748B]">Không có tin đăng nào ở trạng thái này.</div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[18px] shadow-clay-primary overflow-hidden flex flex-col border-none">
          {selectedRoom ? (
            <>
              <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F5F7FA]">
                <div>
                  <h2 className="text-h2 font-bold text-[#0F172A] mb-1">Chi tiết tin đăng</h2>
                  <div className="flex items-center gap-2">
                    <img 
                      src={getLandlordAvatar(selectedRoom)} 
                      alt={selectedRoom.landlordName} 
                      className="w-7 h-7 rounded-full object-cover border border-[#00153D]/20 cursor-pointer"
                      onClick={() => setPreviewAvatar(getLandlordAvatar(selectedRoom))}
                    />
                    <p className="text-caption text-[#64748B]">
                      Chủ trọ: <span className="font-semibold text-[#0F172A]">{selectedRoom.landlordName}</span>
                      {selectedRoom.landlordPhone && ` • SĐT: ${selectedRoom.landlordPhone}`}
                    </p>
                  </div>
                </div>
                <div>
                  {renderStatusBadge(selectedRoom.status)}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                {/* 1. Card Thông tin Chủ trọ (Hình ảnh & Thông tin chi tiết) */}
                <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[14px] border border-[#E2E8F0] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => setPreviewAvatar(getLandlordAvatar(selectedRoom))}
                      title="Bấm để xem ảnh phóng to"
                    >
                      <img 
                        src={getLandlordAvatar(selectedRoom)} 
                        alt={selectedRoom.landlordName} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#00153D] shadow-md group-hover:opacity-90 transition-opacity" 
                      />
                      <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold">
                        Xem ảnh
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-h3 text-[#0F172A]">{selectedRoom.landlordName}</h3>
                        {selectedRoom.isVerifiedLandlord ? (
                          <span className="bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Đã xác minh chính chủ
                          </span>
                        ) : (
                          <span className="bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" /> Chưa xác minh
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-caption text-[#64748B]">
                        {selectedRoom.landlordPhone && (
                          <span className="flex items-center gap-1 font-semibold text-[#0F172A]">
                            <Phone className="w-3.5 h-3.5 text-[#00153D]" /> {selectedRoom.landlordPhone}
                          </span>
                        )}
                        {selectedRoom.landlordEmail && (
                          <span className="flex items-center gap-1 text-[#64748B]">
                            <Mail className="w-3.5 h-3.5 text-[#00153D]" /> {selectedRoom.landlordEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setPreviewAvatar(getLandlordAvatar(selectedRoom))}
                    className="shrink-0 text-caption font-semibold inline-flex items-center gap-1.5"
                  >
                    <ZoomIn className="w-4 h-4 text-[#00153D]" /> Phóng to ảnh chủ trọ
                  </Button>
                </Card>

                {/* 2. Gallery Hình ảnh bài đăng */}
                {selectedRoom.images && selectedRoom.images.length > 0 && (
                  <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                    <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-3">Hình ảnh phòng trọ thực tế ({selectedRoom.images.length} ảnh)</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedRoom.images.map((img, idx) => (
                        <div key={img.id || idx} className="h-28 rounded-lg overflow-hidden border border-[#E2E8F0] bg-black/5 cursor-pointer" onClick={() => setPreviewImage(img.imageUrl)}>
                          <img src={img.imageUrl} alt={`Room detail ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* 3. Thông tin chính */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                    <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-1">Giá thuê</h4>
                    <p className="text-h3 font-bold text-[#00153D]">{Number(selectedRoom.price).toLocaleString('vi-VN')} ₫/tháng</p>
                  </Card>
                  <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                    <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-1">Diện tích & Loại phòng</h4>
                    <p className="text-h3 font-bold text-[#0F172A]">{selectedRoom.roomType || 'Studio'} • {selectedRoom.area || 25} m²</p>
                  </Card>
                  <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                    <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-1">Ngày tạo tin</h4>
                    <p className="text-body font-bold text-[#0F172A]">{new Date(selectedRoom.createdAt).toLocaleDateString('vi-VN')}</p>
                  </Card>
                </div>

                {/* 3. Tiêu đề & Địa chỉ */}
                <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                  <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-1">Tiêu đề tin đăng</h4>
                  <p className="text-body font-bold text-[#0F172A] mb-3">{selectedRoom.title}</p>
                  <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-1">Địa chỉ chi tiết</h4>
                  <p className="text-body font-medium text-[#0F172A]">{selectedRoom.address}</p>
                </Card>

                {/* 4. Tiện ích */}
                {selectedRoom.utilities && (
                  <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                    <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-2">Tiện ích đi kèm</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.utilities.split(',').map((util, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-[#CBD5E1] rounded-lg text-caption font-semibold text-[#00153D] shadow-sm inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#16803C]" /> {util.trim()}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* 5. Mô tả chi tiết */}
                {selectedRoom.description && (
                  <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                    <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-2">Mô tả chi tiết từ chủ trọ</h4>
                    <p className="text-body text-[#334155] whitespace-pre-line leading-relaxed">{selectedRoom.description}</p>
                  </Card>
                )}

                {/* 6. Virtual 3D Tour */}
                {selectedRoom.virtual3DUrl && (
                  <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                    <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-1">Link 3D Virtual Tour</h4>
                    <a href={selectedRoom.virtual3DUrl} target="_blank" rel="noreferrer" className="text-body text-[#00153D] font-bold underline hover:text-blue-600 break-all inline-flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" /> {selectedRoom.virtual3DUrl}
                    </a>
                  </Card>
                )}
              </div>

              <div className="p-6 border-t border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between gap-3">
                <span className="text-caption text-[#64748B] font-semibold">Chuyển trạng thái:</span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] hover:bg-[#FDE68A] inline-flex items-center gap-1.5"
                    onClick={() => handleAction(selectedRoom.id, 2)}
                  >
                    <Clock className="w-4 h-4" /> Chờ duyệt
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA] hover:bg-[#FEE2E2] inline-flex items-center gap-1.5"
                    onClick={() => handleAction(selectedRoom.id, 3)}
                  >
                    <XCircle className="w-4 h-4" /> Từ chối
                  </Button>
                  <Button
                    variant="primary"
                    className="btn-clay-primary inline-flex items-center gap-1.5"
                    onClick={() => handleAction(selectedRoom.id, 0)}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Phê duyệt
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
              <p className="text-body font-semibold">Chọn một tin đăng từ hàng đợi để xem xét.</p>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Preview Modal Overlay */}
      {previewAvatar && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewAvatar(null)}
        >
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full flex flex-col items-center space-y-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewAvatar(null)} 
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F7FA]"
            >
              ✕
            </button>
            <h3 className="font-bold text-h3 text-[#0F172A]">Chân dung Chủ trọ</h3>
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#00153D] shadow-lg bg-[#F5F7FA]">
              <img src={previewAvatar} alt="Chân dung chủ nhà" className="w-full h-full object-cover" />
            </div>
            <p className="text-caption text-[#64748B] font-semibold">{selectedRoom?.landlordName}</p>
            <Button variant="secondary" size="sm" onClick={() => setPreviewAvatar(null)} className="w-full">Đóng</Button>
          </div>
        </div>
      )}

      {/* Room Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="Ảnh phòng trọ" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
