import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationsApi, imagesApi } from '../../services/api';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import { 
  X, 
  FileText, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  Users, 
  Clock, 
  Upload, 
  CheckCircle, 
  ShieldCheck 
} from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../../utils/motion';

interface RentalApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomTitle: string;
  roomPrice: number;
  landlordName: string;
  onSuccess?: () => void;
}

export default function RentalApplicationModal({
  isOpen,
  onClose,
  roomId,
  roomTitle,
  roomPrice,
  landlordName,
  onSuccess
}: RentalApplicationModalProps) {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const [monthlyIncome, setMonthlyIncome] = useState<number>(10000000);
  const [occupation, setOccupation] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [occupantsCount, setOccupantsCount] = useState<number>(1);
  const [desiredMoveInDate, setDesiredMoveInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [leaseDurationMonths, setLeaseDurationMonths] = useState<number>(12);
  const [noteToLandlord, setNoteToLandlord] = useState('');
  const [documents, setDocuments] = useState<{ documentType: string; fileUrl: string; name?: string }[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      const res = await imagesApi.uploadImage(file);
      if (res && res.imageUrl) {
        setDocuments(prev => [...prev, { documentType: docType, fileUrl: res.imageUrl, name: file.name }]);
        toast.success(`Đã tải lên tệp: ${file.name}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải lên tài liệu.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeDoc = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Vui lòng đăng nhập với tài khoản Khách thuê để nộp hồ sơ!');
      navigate('/auth');
      return;
    }

    if (!occupation.trim()) {
      toast.error('Vui lòng nhập nghề nghiệp hoặc công việc hiện tại.');
      return;
    }

    if (monthlyIncome <= 0) {
      toast.error('Vui lòng nhập thu nhập hàng tháng hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      await applicationsApi.createApplication({
        roomId,
        monthlyIncome,
        occupation: occupation.trim(),
        employerName: employerName.trim() || undefined,
        occupantsCount,
        desiredMoveInDate: `${desiredMoveInDate}T00:00:00Z`,
        leaseDurationMonths,
        noteToLandlord: noteToLandlord.trim() || undefined,
        documents: documents.map(d => ({ documentType: d.documentType, fileUrl: d.fileUrl }))
      });

      setSubmittedSuccess(true);
      toast.success('Hồ sơ thuê phòng đã được gửi thành công!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi hồ sơ thuê. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <motion.div 
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[20px] shadow-clay-primary max-w-2xl w-full my-8 overflow-hidden border border-[#E2E8F0] motion-gpu"
          >
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#00153D] to-[#1E3A8A] text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-indigo-300" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-indigo-200">Rental Application</span>
                </div>
                <h2 className="text-xl font-bold">Nộp hồ sơ thuê phòng</h2>
                <p className="text-xs text-indigo-100 mt-1 line-clamp-1">
                  {roomTitle} — {roomPrice.toLocaleString()} VNĐ/tháng
                </p>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="p-8 text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm"
                >
                  <CheckCircle className="w-10 h-10" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#0F172A]">Hồ sơ đã được gửi thành công!</h3>
                  <p className="text-sm text-[#64748B] max-w-md mx-auto">
                    Chủ nhà <span className="font-semibold text-[#0F172A]">{landlordName}</span> đã nhận được hồ sơ của bạn. Bạn có thể theo dõi tiến độ duyệt và chuẩn bị hợp đồng tại trang quản lý hồ sơ.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/tenant/applications');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#00153D] text-white font-semibold text-sm hover:bg-[#002266] transition-colors shadow-sm"
              >
                Xem hồ sơ đã gửi
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] font-semibold text-sm hover:bg-[#E2E8F0] transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Trust Banner */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3 text-xs text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Hồ sơ được bảo mật theo tiêu chuẩn DORMI Trust</p>
                <p className="text-blue-700 mt-0.5">
                  Thông tin thu nhập và tài liệu của bạn chỉ được chuyển tới chủ nhà để thẩm định khả năng thuê phòng.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Occupation */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                  Nghề nghiệp / Công việc <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Kỹ sư phần mềm, Sinh viên..."
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] outline-none focus:border-[#00153D] transition-colors"
                  />
                </div>
              </div>

              {/* Monthly Income */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                  Thu nhập hàng tháng (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="number"
                    required
                    min={0}
                    step={500000}
                    value={monthlyIncome}
                    onChange={e => setMonthlyIncome(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] outline-none focus:border-[#00153D] transition-colors"
                  />
                </div>
              </div>

              {/* Employer / Workplace */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                  Cơ quan / Trường học
                </label>
                <input
                  type="text"
                  placeholder="VD: Công ty FPT, ĐH Bách Khoa..."
                  value={employerName}
                  onChange={e => setEmployerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] outline-none focus:border-[#00153D] transition-colors"
                />
              </div>

              {/* Occupants Count */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                  Số lượng người ở cùng
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <select
                    value={occupantsCount}
                    onChange={e => setOccupantsCount(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] outline-none focus:border-[#00153D] transition-colors"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num} người
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Move-in Date */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                  Ngày dự kiến dọn vào <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={desiredMoveInDate}
                    onChange={e => setDesiredMoveInDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] outline-none focus:border-[#00153D] transition-colors"
                  />
                </div>
              </div>

              {/* Lease Duration */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                  Thời hạn hợp đồng mong muốn
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <select
                    value={leaseDurationMonths}
                    onChange={e => setLeaseDurationMonths(Number(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] outline-none focus:border-[#00153D] transition-colors"
                  >
                    <option value={3}>3 tháng</option>
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng (1 năm)</option>
                    <option value={24}>24 tháng (2 năm)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Note to Landlord */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                Lời nhắn gửi tới chủ nhà
              </label>
              <textarea
                rows={3}
                placeholder="Giới thiệu thêm về bản thân, thói quen sinh hoạt hoặc yêu cầu đặc biệt..."
                value={noteToLandlord}
                onChange={e => setNoteToLandlord(e.target.value)}
                className="w-full p-3.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] outline-none focus:border-[#00153D] transition-colors resize-none"
              />
            </div>

            {/* Document Attachments */}
            <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#475569] uppercase">
                    Tài liệu chứng minh (CCCD / Bảng lương / Thẻ sinh viên)
                  </h4>
                  <p className="text-xs text-[#94A3B8]">Tăng 30% tốc độ phê duyệt hồ sơ từ chủ nhà</p>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#00153D] text-xs font-semibold rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingDoc ? 'Đang tải...' : 'Tải lên tài liệu'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={uploadingDoc}
                    onChange={e => handleFileUpload(e, 'ID_CARD')}
                  />
                </label>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="font-medium text-[#0F172A] truncate">{doc.name || `Tài liệu ${idx + 1}`}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">{doc.documentType}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDoc(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#CBD5E1] text-[#475569] font-semibold text-sm hover:bg-[#F1F5F9] transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingDoc}
                className="px-6 py-2.5 rounded-xl bg-[#00153D] hover:bg-[#002266] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang nộp hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Nộp hồ sơ thuê</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
