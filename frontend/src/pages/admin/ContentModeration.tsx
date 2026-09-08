import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../services/api';
import { toast } from 'sonner';

interface ModerationRoomItem {
  id: string;
  title: string;
  address: string;
  price: number;
  landlordName: string;
  status: number;
  createdAt: string;
}

export default function ContentModeration() {
  const [rooms, setRooms] = useState<ModerationRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | number>('all');

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
        return <span className="text-caption font-bold bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] px-2.5 py-0.5 rounded-full">✓ Đã duyệt (Công khai)</span>;
      case 2:
        return <span className="text-caption font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">⏳ Chờ phê duyệt</span>;
      case 3:
        return <span className="text-caption font-bold bg-[#FEF2F2] text-[#C62828] border border-[#FECACA] px-2.5 py-0.5 rounded-full">✕ Bị từ chối / Ẩn</span>;
      case 1:
        return <span className="text-caption font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">Đã thuê</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Kiểm duyệt nội dung phòng trọ (Admin Portal)</h1>
          <p className="text-body text-[#64748B]">Xem xét và phê duyệt các tin đăng bài trọ với 3 trạng thái: Chờ duyệt, Đã duyệt, và Từ chối.</p>
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
                <p className="text-caption text-[#64748B] mt-1">Chủ trọ: <span className="font-semibold text-[#0F172A]">{room.landlordName}</span></p>
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
              <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
                <div>
                  <h2 className="text-h2 font-bold text-[#0F172A] mb-1">Chi tiết tin đăng</h2>
                  <p className="text-caption text-[#64748B]">Chủ trọ: <span className="font-semibold text-[#0F172A]">{selectedRoom.landlordName}</span></p>
                </div>
                <div>
                  {renderStatusBadge(selectedRoom.status)}
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                  <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-2">Tiêu đề bài trọ</h4>
                  <p className="text-body font-bold text-[#0F172A]">{selectedRoom.title}</p>
                </Card>
                <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                  <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-2">Địa chỉ & Giá thuê</h4>
                  <p className="text-body font-bold text-[#0F172A]">{selectedRoom.address} - {Number(selectedRoom.price).toLocaleString('vi-VN')}₫/tháng</p>
                </Card>
              </div>
              <div className="p-6 border-t border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between gap-3">
                <span className="text-caption text-[#64748B] font-semibold">Chuyển trạng thái:</span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] hover:bg-[#FDE68A]"
                    onClick={() => handleAction(selectedRoom.id, 2)}
                  >
                    Chờ duyệt
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA] hover:bg-[#FEE2E2]"
                    onClick={() => handleAction(selectedRoom.id, 3)}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="primary"
                    className="btn-clay-primary"
                    onClick={() => handleAction(selectedRoom.id, 0)}
                  >
                    Phê duyệt
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
    </div>
  );
}
