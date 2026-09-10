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
      toast.success(approved ? 'Đã duyệt xác minh chủ trọ!' : 'Đã từ chối xác minh.');
      loadQueue();
    } catch {
      toast.error('Thao tác không thành công.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F8FAFC]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Xác minh chủ phòng</h1>
          <p className="text-sm text-slate-500 mt-1">Kiểm tra thông tin chủ trọ trước khi cấp quyền đăng tin công khai.</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <span>{queue.length} chủ trọ đang chờ duyệt</span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2">
          {loading && (
            <p className="text-slate-400 text-center py-8 bg-white rounded-xl border border-slate-200">Đang tải danh sách chờ...</p>
          )}
          {!loading && queue.length === 0 && (
            <p className="text-slate-400 text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">Không có yêu cầu xác minh nào đang chờ.</p>
          )}
          {queue.map(item => (
            <Card 
              key={item.landlordId} 
              onClick={() => setSelectedId(item.landlordId)}
              className={`p-4 cursor-pointer transition-all rounded-xl border ${selectedId === item.landlordId ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-100' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{item.fullName}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.email}</p>
                </div>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full">Chờ duyệt</span>
              </div>
            </Card>
          ))}
        </div>

        {selectedItem ? (
          <Card className="flex-1 flex flex-col p-6 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hồ sơ chủ trọ: {selectedItem.fullName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Xác nhận thông tin liên lạc và quyền đăng tin</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs px-3" onClick={() => handleAction(selectedItem.landlordId, false)}>Từ chối</Button>
                <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5" onClick={() => handleAction(selectedItem.landlordId, true)}>Duyệt xác minh</Button>
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
