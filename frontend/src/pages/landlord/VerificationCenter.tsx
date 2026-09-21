import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { landlordApi } from '../../services/api';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import { ShieldCheck, Clock, AlertTriangle, UploadCloud, Check, X } from 'lucide-react';

export default function VerificationCenter() {
  const { uploadImageToCloudinary } = useStore();
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<any>(null);
  
  const [docType, setDocType] = useState('CCCD');
  const [docNumber, setDocNumber] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await landlordApi.getVerificationStatus();
      if (res && res.status) {
        setCurrentStatus(res);
      }
    } catch {
      // No prior verification request
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (side === 'front') setUploadingFront(true);
      else setUploadingBack(true);

      const url = await uploadImageToCloudinary(file);
      if (url) {
        if (side === 'front') setFrontImageUrl(url);
        else setBackImageUrl(url);
        toast.success(`Đã tải lên ảnh mặt ${side === 'front' ? 'trước' : 'sau'} thành công!`);
      } else {
        toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh.');
    } finally {
      if (side === 'front') setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImageUrl || !backImageUrl) {
      toast.error('Vui lòng cung cấp đầy đủ ảnh mặt trước và mặt sau của giấy tờ!');
      return;
    }

    try {
      setSubmitting(true);
      await landlordApi.submitVerification({
        documentType: docType,
        documentNumber: docNumber,
        frontImageUrl,
        backImageUrl
      });
      toast.success('Hồ sơ xác minh đã được gửi thành công!', {
        description: 'Ban quản trị sẽ duyệt hồ sơ của bạn trong vòng 24 giờ làm việc.'
      });
      fetchStatus();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi hồ sơ xác minh.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-[#64748B]">
        Đang tải thông tin xác minh...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A] flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
          Trung tâm xác minh danh tính Chủ trọ
        </h1>
        <p className="text-body text-[#64748B] mt-1">
          Chứng thực danh tính chính chủ bằng Căn cước công dân, Hộ chiếu hoặc Giấy phép kinh doanh để nhận huy hiệu "Đã xác minh" và gia tăng độ tin cậy đối với người tìm phòng.
        </p>
      </div>

      {currentStatus?.status === 'Approved' && (
        <Card className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-[18px] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#16803C] flex items-center justify-center text-white font-bold">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-h3 font-bold text-[#16803C]">Tài khoản đã được xác thực chính chủ</h3>
              <p className="text-caption text-[#16803C]/80">
                Loại giấy tờ: {currentStatus.documentType || 'CCCD'} ({currentStatus.documentNumber || 'Đã kiểm tra'})
              </p>
            </div>
          </div>
          <p className="text-body text-[#16803C]">
            Tất cả các tin đăng của bạn sẽ tự động hiển thị huy hiệu <strong>"Chủ trọ đã xác minh"</strong>, giúp nâng cao mức độ uy tín và tăng độ tin cậy với người tìm trọ.
          </p>
        </Card>
      )}

      {currentStatus?.status === 'Pending' && (
        <Card className="bg-[#FEFCE8] border border-[#FEF08A] rounded-[18px] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-[#CA8A04]" />
            <div>
              <h3 className="text-h3 font-bold text-[#CA8A04]">Hồ sơ đang chờ Ban quản trị xét duyệt</h3>
              <p className="text-caption text-[#CA8A04]/80">
                Ngày gửi: {new Date(currentStatus.submittedAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-[12px] overflow-hidden border border-[#FEF08A] bg-white p-2">
              <p className="text-caption font-semibold text-[#64748B] mb-1">Mặt trước</p>
              <img src={currentStatus.frontImageUrl} alt="Mặt trước" className="w-full h-32 object-cover rounded-[8px]" />
            </div>
            <div className="rounded-[12px] overflow-hidden border border-[#FEF08A] bg-white p-2">
              <p className="text-caption font-semibold text-[#64748B] mb-1">Mặt sau</p>
              <img src={currentStatus.backImageUrl} alt="Mặt sau" className="w-full h-32 object-cover rounded-[8px]" />
            </div>
          </div>
        </Card>
      )}

      {currentStatus?.status === 'Rejected' && (
        <Card className="bg-[#FEF2F2] border border-[#FECACA] rounded-[18px] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#DC2626]" />
            <div>
              <h3 className="text-h3 font-bold text-[#DC2626]">Hồ sơ xác minh đã bị từ chối</h3>
              <p className="text-body text-[#DC2626] font-medium mt-1">
                Lý do từ Ban quản trị: {currentStatus.rejectReason || 'Ảnh chụp bị mờ hoặc không trùng khớp thông tin.'}
              </p>
            </div>
          </div>
          <p className="text-caption text-[#64748B]">Vui lòng kiểm tra lại hình ảnh giấy tờ và nộp lại hồ sơ bên dưới.</p>
        </Card>
      )}

      {(!currentStatus || currentStatus.status === 'Rejected') && (
        <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-caption font-semibold text-[#0F172A] mb-1.5">Loại giấy tờ định danh</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-[12px] border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] bg-[#F8FAFC] text-body"
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                >
                  <option value="CCCD">Căn cước công dân (CCCD gắn chip)</option>
                  <option value="Passport">Hộ chiếu Việt Nam</option>
                  <option value="BusinessLicense">Giấy phép đăng ký kinh doanh</option>
                </select>
              </div>

              <div>
                <label className="block text-caption font-semibold text-[#0F172A] mb-1.5">Số giấy tờ (CCCD / Hộ chiếu / GPKD)</label>
                <Input 
                  placeholder="Ví dụ: 079090001234"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Mặt trước */}
              <div className="space-y-2">
                <label className="block text-caption font-semibold text-[#0F172A]">Ảnh mặt trước giấy tờ</label>
                <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-4 text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors relative">
                  {frontImageUrl ? (
                    <div className="relative group">
                      <img src={frontImageUrl} alt="Front Doc" className="w-full h-40 object-cover rounded-[10px]" />
                      <button
                        type="button"
                        onClick={() => setFrontImageUrl('')}
                        className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-full text-xs hover:bg-[#B91C1C] transition-colors"
                        aria-label="Xóa ảnh mặt trước"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-[#94A3B8]" />
                      <p className="text-caption text-[#64748B]">Tải lên ảnh chụp mặt trước</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'front')}
                        disabled={uploadingFront}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {uploadingFront && <p className="text-caption text-[#2563EB] animate-pulse">Đang tải lên...</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Mặt sau */}
              <div className="space-y-2">
                <label className="block text-caption font-semibold text-[#0F172A]">Ảnh mặt sau giấy tờ</label>
                <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-4 text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors relative">
                  {backImageUrl ? (
                    <div className="relative group">
                      <img src={backImageUrl} alt="Back Doc" className="w-full h-40 object-cover rounded-[10px]" />
                      <button
                        type="button"
                        onClick={() => setBackImageUrl('')}
                        className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-full text-xs hover:bg-[#B91C1C] transition-colors"
                        aria-label="Xóa ảnh mặt sau"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-[#94A3B8]" />
                      <p className="text-caption text-[#64748B]">Tải lên ảnh chụp mặt sau</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'back')}
                        disabled={uploadingBack}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {uploadingBack && <p className="text-caption text-[#2563EB] animate-pulse">Đang tải lên...</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={submitting || !frontImageUrl || !backImageUrl || !docNumber}
                className="px-8 shadow-clay-soft"
              >
                {submitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ xác minh CCCD'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
