import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../services/api';
import { toast } from 'sonner';

interface PendingVerificationItem {
  landlordId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export default function VerificationModeration() {
  const [queue, setQueue] = useState<PendingVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPendingVerifications();
      if (res && Array.isArray(res)) {
        setQueue(res);
        if (res.length > 0) setSelectedId(res[0].landlordId);
      }
    } catch (err) {
      console.warn('Failed to load pending verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const selectedItem = queue.find(item => item.landlordId === selectedId);

  const handleAction = async (landlordId: string, approved: boolean) => {
    try {
      await adminApi.approveVerification(landlordId, approved);
      toast.success(approved ? 'Đã phê duyệt xác minh chủ trọ (API)!' : 'Đã từ chối xác minh (API).');
      loadQueue();
    } catch {
      toast.error('Thao tác không thành công.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Xác thực danh tính chủ trọ (API Realtime)</h1>
          <p className="text-body text-[#64748B]">Xem xét danh sách chủ trọ chờ duyệt từ Backend API.</p>
        </div>
        <div className="flex gap-2 text-caption font-semibold text-[#64748B]">
          <span>{queue.length} hồ sơ đang chờ</span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          {loading && (
            <p className="text-[#64748B] text-center py-8 bg-white rounded-[18px] shadow-clay-soft">Đang tải danh sách chờ...</p>
          )}
          {!loading && queue.length === 0 && (
            <p className="text-[#64748B] text-center py-8 bg-white rounded-[18px] shadow-clay-soft">Không có yêu cầu xác thực nào đang chờ.</p>
          )}
          {queue.map(item => (
            <Card 
              key={item.landlordId} 
              onClick={() => setSelectedId(item.landlordId)}
              className={`p-4 cursor-pointer transition-all rounded-[18px] ${selectedId === item.landlordId ? 'bg-white shadow-clay-primary border-2 border-[#00153D]' : 'bg-white shadow-clay-soft hover:-translate-y-[2px]'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[#0F172A] text-body">{item.fullName}</p>
                  <p className="text-caption text-[#64748B] mt-1">{item.email}</p>
                </div>
                <span className="bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-caption font-bold px-2.5 py-0.5 rounded-full">Chờ duyệt</span>
              </div>
            </Card>
          ))}
        </div>

        {selectedItem ? (
          <Card className="flex-1 flex flex-col p-6 overflow-hidden bg-white rounded-[18px] shadow-clay-primary border-none">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E2E8F0]">
              <h2 className="text-h3 font-bold text-[#0F172A]">Hồ sơ của {selectedItem.fullName}</h2>
              <div className="flex gap-2">
                <Button variant="secondary" className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA]" onClick={() => handleAction(selectedItem.landlordId, false)}>Từ chối API</Button>
                <Button variant="primary" onClick={() => handleAction(selectedItem.landlordId, true)}>Phê duyệt & Xác thực API</Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-caption font-semibold text-[#64748B] uppercase tracking-wider mb-3">Thông tin người dùng</h3>
                <div className="grid grid-cols-2 gap-4 bg-[#F5F7FA] shadow-clay-inset p-4 rounded-[12px]">
                  <div><p className="text-caption text-[#64748B]">Họ và tên</p><p className="font-bold text-[#0F172A] text-body">{selectedItem.fullName}</p></div>
                  <div><p className="text-caption text-[#64748B]">Số điện thoại</p><p className="font-bold text-[#0F172A] text-body">{selectedItem.phoneNumber || 'Chưa cung cấp'}</p></div>
                  <div><p className="text-caption text-[#64748B]">Email đăng ký</p><p className="font-bold text-[#0F172A] text-body">{selectedItem.email}</p></div>
                  <div><p className="text-caption text-[#64748B]">Vai trò</p><p className="font-bold text-[#0F172A] text-body">Chủ trọ</p></div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col p-6 items-center justify-center text-[#64748B] bg-white rounded-[18px] shadow-clay-soft">
            <p className="text-body font-semibold">Chọn một hồ sơ để xem chi tiết.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
