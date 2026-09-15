import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { tenantReviewsApi } from '../../services/api';
import { toast } from 'sonner';
import { Star, X, UserCheck, AlertCircle } from 'lucide-react';

interface TenantRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLeaseId?: string;
  onSuccess?: () => void;
}

export function TenantRatingModal({
  isOpen,
  onClose,
  initialLeaseId,
  onSuccess
}: TenantRatingModalProps) {
  const [leases, setLeases] = useState<any[]>([]);
  const [loadingLeases, setLoadingLeases] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>(initialLeaseId || '');
  const [rating, setRating] = useState<number>(5);
  const [punctualityScore, setPunctualityScore] = useState<number>(5);
  const [cleanlinessScore, setCleanlinessScore] = useState<number>(5);
  const [respectScore, setRespectScore] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoadingLeases(true);
    tenantReviewsApi.getMyLeases()
      .then(res => {
        if (Array.isArray(res)) {
          setLeases(res);
          if (res.length > 0 && !selectedLeaseId) {
            setSelectedLeaseId(initialLeaseId || res[0].id);
          }
        }
      })
      .catch(err => {
        console.warn('Failed to load leases for rating:', err);
      })
      .finally(() => {
        setLoadingLeases(false);
      });
  }, [isOpen, initialLeaseId]);

  if (!isOpen) return null;

  const currentLease = leases.find(l => l.id === selectedLeaseId) || leases[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLease) {
      toast.error('Vui lòng chọn hợp đồng thuê của khách cần đánh giá.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét chi tiết về khách thuê.');
      return;
    }

    try {
      setSubmitting(true);
      await tenantReviewsApi.rateTenant({
        tenantId: currentLease.tenantId,
        leaseContractId: currentLease.id,
        leaseId: currentLease.id,
        rating,
        punctualityScore,
        cleanlinessScore,
        respectScore,
        comment: comment.trim(),
        isAnonymous
      });

      toast.success('Đã gửi đánh giá uy tín khách thuê thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi đánh giá. Có thể bạn đã đánh giá hợp đồng này rồi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-[20px] shadow-clay-primary max-w-lg w-full p-6 space-y-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-h3 font-bold text-[#0F172A] flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-[#2563EB]" />
              Đánh giá uy tín khách thuê
            </h3>
            <p className="text-caption text-[#64748B] mt-0.5">
              Góp phần xây dựng cộng đồng thuê trọ minh bạch và an toàn.
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto flex-1 pr-1">
          {loadingLeases ? (
            <div className="py-8 text-center text-caption text-[#64748B]">Đang tải danh sách hợp đồng thuê...</div>
          ) : leases.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-[12px] border border-amber-200 text-caption text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Chưa có hợp đồng thuê phòng</p>
                <p className="mt-1">
                  Chỉ có thể đánh giá người thuê khi hai bên đã có hợp đồng thuê phòng (LeaseContract) được ký kết trên hệ thống DORMI.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Lease Select */}
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-[#0F172A] block">
                  Chọn khách thuê / Hợp đồng
                </label>
                <select
                  value={selectedLeaseId}
                  onChange={e => setSelectedLeaseId(e.target.value)}
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] px-3.5 py-2.5 text-body text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white"
                >
                  {leases.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.tenantName} - {l.roomTitle} ({new Date(l.startDate).toLocaleDateString('vi-VN')} - {new Date(l.endDate).toLocaleDateString('vi-VN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Rating (Stars) */}
              <div className="space-y-1.5">
                <label className="text-caption font-semibold text-[#0F172A] block">
                  Đánh giá tổng quan ({rating}/5 sao)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <p className="text-caption font-bold text-[#0F172A]">Điểm thành phần (1 - 5 sao)</p>
                
                {/* Punctuality */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-caption text-[#475569] font-medium">Đúng hạn trả tiền phòng / quy tắc hẹn:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPunctualityScore(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          punctualityScore === v
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-caption text-[#475569] font-medium">Giữ gìn vệ sinh không gian sống:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCleanlinessScore(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          cleanlinessScore === v
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Respectfulness */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-caption text-[#475569] font-medium">Tôn trọng nội quy & hàng xóm:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRespectScore(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          respectScore === v
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <label className="text-caption font-semibold text-[#0F172A] block">
                  Nhận xét khách quan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Ví dụ: Khách đóng tiền phòng rất đúng hẹn, giữ gìn phòng sạch sẽ và hòa đồng với mọi người..."
                  className="w-full bg-[#F5F7FA] shadow-clay-inset border border-[#E2E8F0] rounded-[12px] p-3 text-body text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00153D] focus:bg-white text-caption"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="anonCheck" className="text-caption text-[#64748B] cursor-pointer">
                  Đánh giá ẩn danh (Ẩn tên chủ trọ để bảo vệ quyền riêng tư)
                </label>
              </div>
            </>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button type="button" variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            {leases.length > 0 && (
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
