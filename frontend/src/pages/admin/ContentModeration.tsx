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

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getRoomsForModeration();
      if (res && Array.isArray(res)) {
        setRooms(res);
        if (res.length > 0) setSelectedId(res[0].id);
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

  const selectedRoom = rooms.find(r => r.id === selectedId);

  const handleAction = async (roomId: string, status: number) => {
    try {
      await adminApi.updateRoomStatus(roomId, status);
      toast.success('Đã cập nhật trạng thái phòng trọ thành công (API)!');
      loadRooms();
    } catch {
      toast.error('Thao tác không thành công.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Kiểm duyệt nội dung phòng trọ (API Realtime)</h1>
          <p className="text-body text-[#64748B]">Xem xét và phê duyệt các tin đăng bài trọ từ Backend API.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-1/3 flex flex-col bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FA]">
            <h3 className="font-bold text-h3 text-[#0F172A] flex justify-between items-center">
              Danh sách tin đăng
              <span className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA] px-2.5 py-0.5 rounded-full text-caption">{rooms.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading && <div className="p-8 text-center text-[#64748B]">Đang tải danh sách phòng...</div>}
            {!loading && rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => setSelectedId(room.id)}
                className={`p-4 rounded-[14px] cursor-pointer transition-all ${selectedId === room.id ? 'bg-white shadow-clay-primary border-2 border-[#00153D]' : 'bg-[#F5F7FA] border border-[#E2E8F0] hover:bg-white'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-caption font-bold bg-[#F0FDF4] text-[#16803C] border border-[#DCFCE7] px-2 py-0.5 rounded-full">
                    {room.status === 0 ? 'Còn trống' : 'Đã thuê/Ẩn'}
                  </span>
                </div>
                <p className="font-semibold text-[#0F172A] text-body line-clamp-1">{room.title}</p>
                <p className="text-caption text-[#64748B] mt-1">Chủ trọ: <span className="font-semibold text-[#0F172A]">{room.landlordName}</span></p>
              </div>
            ))}
            {!loading && rooms.length === 0 && (
              <div className="p-8 text-center text-[#64748B]">Không có tin đăng nào.</div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[18px] shadow-clay-primary overflow-hidden flex flex-col border-none">
          {selectedRoom ? (
            <>
              <div className="p-6 border-b border-[#E2E8F0]">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-h2 font-bold text-[#0F172A] mb-1">Chi tiết tin đăng</h2>
                    <p className="text-caption text-[#64748B]">Chủ trọ: <span className="font-semibold text-[#0F172A]">{selectedRoom.landlordName}</span></p>
                  </div>
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
              <div className="p-6 border-t border-[#E2E8F0] bg-[#F5F7FA] flex justify-end gap-3">
                <Button variant="secondary" className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA]" onClick={() => handleAction(selectedRoom.id, 1)}>Tạm ẩn tin API</Button>
                <Button variant="primary" onClick={() => handleAction(selectedRoom.id, 0)}>Phê duyệt Công khai API</Button>
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
