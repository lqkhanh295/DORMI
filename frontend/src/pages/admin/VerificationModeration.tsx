import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { adminApi } from '../../services/api';
import { toast } from 'sonner';
import { ShieldCheck, ZoomIn, X, AlertTriangle } from 'lucide-react';

interface VerificationRequestItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  documentType: string;
  documentNumber?: string;
  frontImageUrl: string;
  backImageUrl: string;
  status: string;
  submittedAt: string;
}

export default function VerificationModeration() {
  const [queue, setQueue] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPendingVerifications();
      if (res && Array.isArray(res)) {
        setQueue(res);
        if (res.length > 0 && !selectedId) setSelectedId(res[0].id);
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

  const selectedItem = queue.find(item => item.id === selectedId) || queue[0];

  const handleApprove = async () => {
    if (!selectedItem) return;
    try {
      setProcessing(true);
      await adminApi.approveVerification(selectedItem.id, true);
      toast.success(`Đã phê duyệt xác minh thành công cho ${selectedItem.fullName}!`);
      loadQueue();
    } catch {
      toast.error('Phê duyệt không thành công.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối để thông báo cho chủ trọ.');
      return;
    }

    try {
      setProcessing(true);
      await adminApi.approveVerification(selectedItem.id, false, rejectReason);
      toast.success(`Đã từ chối hồ sơ của ${selectedItem.fullName} với lý do: ${rejectReason}`);
      setShowRejectModal(false);
      setRejectReason('');
      loadQueue();
    } catch {
      toast.error('Từ chối không thành công.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F8FAFC]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Kiểm duyệt hồ sơ CCCD / Giấy tờ chủ trọ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm tra đối chiếu ảnh chụp CCCD/Hộ chiếu thực tế của chủ trọ trước khi cấp quyền định danh chính chủ.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <span>{queue.length} hồ sơ đang chờ xét duyệt</span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left column: list of pending requests */}
        <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2">
          {loading && (
            <p className="text-slate-400 text-center py-8 bg-white rounded-xl border border-slate-200">
              Đang tải danh sách hồ sơ...
            </p>
          )}
          {!loading && queue.length === 0 && (
            <p className="text-slate-400 text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
              Không có yêu cầu xác minh nào đang chờ.
            </p>
          )}
          {queue.map(item => (
            <Card 
              key={item.id} 
              onClick={() => setSelectedId(item.id)}
              className={`p-4 cursor-pointer transition-all rounded-xl border ${
                selectedItem?.id === item.id 
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-100' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{item.fullName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Loại: {item.documentType} ({item.documentNumber || 'N/A'})</p>
                </div>
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Chờ duyệt
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Right column: detailed inspection */}
        {selectedItem ? (
          <Card className="flex-1 flex flex-col p-6 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Hồ sơ xác thực: {selectedItem.fullName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ngày nộp: {new Date(selectedItem.submittedAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  disabled={processing}
                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs px-4" 
                  onClick={() => setShowRejectModal(true)}
                >
                  Từ chối
                </Button>
                <Button 
                  variant="primary" 
                  disabled={processing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4" 
                  onClick={handleApprove}
                >
                  Duyệt hồ sơ
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Thông tin đăng ký
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] border border-slate-200 p-4 rounded-[12px]">
                  <div>
                    <p className="text-xs text-[#64748B]">Họ và tên</p>
                    <p className="font-bold text-[#0F172A] text-sm">{selectedItem.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Số điện thoại</p>
                    <p className="font-bold text-[#0F172A] text-sm">{selectedItem.phoneNumber || 'Chưa cung cấp'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Email</p>
                    <p className="font-bold text-[#0F172A] text-sm">{selectedItem.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">Loại giấy tờ & Mã số</p>
                    <p className="font-bold text-[#0F172A] text-sm">
                      {selectedItem.documentType}: <span className="text-indigo-600 font-mono">{selectedItem.documentNumber || 'Chưa nhập'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Hình ảnh tài liệu thực tế (Nhấp vào ảnh để phóng to)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front image */}
                  <div className="border border-slate-200 rounded-[14px] p-3 bg-white space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                      <span>Mặt trước ({selectedItem.documentType})</span>
                      <button 
                        onClick={() => setZoomedImage(selectedItem.frontImageUrl)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                      </button>
                    </div>
                    <div 
                      className="rounded-[10px] overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer h-52 flex items-center justify-center group relative"
                      onClick={() => setZoomedImage(selectedItem.frontImageUrl)}
                    >
                      <img 
                        src={selectedItem.frontImageUrl} 
                        alt="Mặt trước" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                      />
                    </div>
                  </div>

                  {/* Back image */}
                  <div className="border border-slate-200 rounded-[14px] p-3 bg-white space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                      <span>Mặt sau ({selectedItem.documentType})</span>
                      <button 
                        onClick={() => setZoomedImage(selectedItem.backImageUrl)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                      </button>
                    </div>
                    <div 
                      className="rounded-[10px] overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer h-52 flex items-center justify-center group relative"
                      onClick={() => setZoomedImage(selectedItem.backImageUrl)}
                    >
                      <img 
                        src={selectedItem.backImageUrl} 
                        alt="Mặt sau" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                      />
                    </div>
                  </div>
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

      {/* Phóng to ảnh modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 overflow-hidden" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomedImage} alt="Zoomed Document" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Modal từ chối với lý do */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-lg">Từ chối hồ sơ xác minh</h3>
            </div>
            <p className="text-xs text-slate-500">
              Vui lòng nêu rõ lý do từ chối để chủ trọ <strong>{selectedItem.fullName}</strong> biết và bổ sung lại giấy tờ hợp lệ.
            </p>
            <textarea
              rows={3}
              placeholder="Ví dụ: Ảnh chụp mặt sau bị mờ, không rõ ngày cấp và số định danh..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="secondary" 
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="text-xs px-4"
              >
                Hủy
              </Button>
              <Button 
                variant="primary" 
                disabled={processing || !rejectReason.trim()}
                onClick={handleReject}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4"
              >
                {processing ? 'Đang gửi...' : 'Xác nhận từ chối'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
