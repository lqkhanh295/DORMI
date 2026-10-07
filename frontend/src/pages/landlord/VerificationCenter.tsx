import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { landlordApi, roomsApi, trustSafetyApi, type RoomResponse } from '../../services/api';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import { ShieldCheck, Clock, AlertTriangle, UploadCloud, Check, X, Building2, UserCheck, FileCheck, Award, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerificationCenter() {
  const { uploadImageToCloudinary } = useStore();
  const [activeTab, setActiveTab] = useState<'identity' | 'property'>('identity');
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<any>(null);
  
  // Identity state
  const [docType, setDocType] = useState('CCCD');
  const [docNumber, setDocNumber] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Property state
  const [myRooms, setMyRooms] = useState<RoomResponse[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [propDocType, setPropDocType] = useState('PropertyCertificate');
  const [propDocNumber, setPropDocNumber] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propFrontUrl, setPropFrontUrl] = useState('');
  const [propBackUrl, setPropBackUrl] = useState('');
  const [uploadingPropFront, setUploadingPropFront] = useState(false);
  const [uploadingPropBack, setUploadingPropBack] = useState(false);
  const [submittingProperty, setSubmittingProperty] = useState(false);
  const [propertySubmittedSuccess, setPropertySubmittedSuccess] = useState(false);

  const fetchStatusAndRooms = async () => {
    try {
      setLoading(true);
      const [statusRes, roomsRes] = await Promise.allSettled([
        landlordApi.getVerificationStatus(),
        roomsApi.getRooms({ page: 1, pageSize: 50 })
      ]);
      
      if (statusRes.status === 'fulfilled' && statusRes.value?.status) {
        setCurrentStatus(statusRes.value);
      }
      if (roomsRes.status === 'fulfilled' && roomsRes.value?.data) {
        setMyRooms(roomsRes.value.data);
        if (roomsRes.value.data.length > 0) {
          setSelectedRoomId(roomsRes.value.data[0].id);
          setPropAddress(roomsRes.value.data[0].address);
        }
      }
    } catch {
      // Error fetching initial data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndRooms();
  }, []);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = myRooms.find(r => r.id === roomId);
    if (room) {
      setPropAddress(room.address);
    }
  };

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

  const handlePropFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (side === 'front') setUploadingPropFront(true);
      else setUploadingPropBack(true);

      const url = await uploadImageToCloudinary(file);
      if (url) {
        if (side === 'front') setPropFrontUrl(url);
        else setPropBackUrl(url);
        toast.success(`Đã tải lên ảnh giấy tờ thành công!`);
      } else {
        toast.error('Tải ảnh lên thất bại. Vui lòng thử lại.');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh.');
    } finally {
      if (side === 'front') setUploadingPropFront(false);
      else setUploadingPropBack(false);
    }
  };

  const handleSubmitIdentity = async (e: React.FormEvent) => {
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
      toast.success('Hồ sơ xác minh CCCD đã được gửi thành công!', {
        description: 'Ban quản trị sẽ duyệt hồ sơ của bạn trong vòng 24 giờ làm việc.'
      });
      fetchStatusAndRooms();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi hồ sơ xác minh.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propFrontUrl || !propBackUrl) {
      toast.error('Vui lòng tải lên đầy đủ ảnh chụp giấy tờ chủ quyền bất động sản!');
      return;
    }
    if (!propDocNumber || !propAddress) {
      toast.error('Vui lòng điền số giấy tờ và địa chỉ bất động sản!');
      return;
    }

    try {
      setSubmittingProperty(true);
      await trustSafetyApi.submitPropertyVerification({
        roomId: selectedRoomId || undefined,
        documentType: propDocType,
        documentNumber: propDocNumber,
        propertyAddress: propAddress,
        frontImageUrl: propFrontUrl,
        backImageUrl: propBackUrl
      });
      toast.success('Đã gửi hồ sơ xác minh chủ quyền bất động sản thành công!', {
        description: 'Ban quản trị sẽ kiểm tra đối chiếu trong 24 giờ. Căn phòng sẽ nhận ngay +20 điểm DORMI Trust Score khi được phê duyệt.'
      });
      setPropertySubmittedSuccess(true);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi hồ sơ xác minh chủ quyền.');
    } finally {
      setSubmittingProperty(false);
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
          Trung tâm Xác minh & Chuẩn hóa Tin cậy DORMI
        </h1>
        <p className="text-body text-[#64748B] mt-1">
          Nâng cao uy tín kinh doanh bằng cách xác thực danh tính chính chủ và chủ quyền bất động sản. Tin đăng xác thực đạt thứ hạng hiển thị cao hơn và tỷ lệ chốt thuê tăng 3.4 lần.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-[#E2E8F0] p-1.5 rounded-[16px] max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex-1 py-2.5 px-4 rounded-[12px] text-body font-bold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] flex items-center justify-center gap-2 ${
            activeTab === 'identity' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>1. Danh tính (CCCD)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('property')}
          className={`flex-1 py-2.5 px-4 rounded-[12px] text-body font-bold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] flex items-center justify-center gap-2 ${
            activeTab === 'property' 
              ? 'bg-[#00153D] text-white shadow-sm' 
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. Chủ quyền (Sổ đỏ)</span>
        </button>
      </div>

      {/* KYC Flow Progression Tracker */}
      <div className="p-4 bg-white rounded-[16px] border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2">
          <span>Tiến trình thẩm định</span>
          <span className="text-[#00153D] font-bold">
            {currentStatus?.status === 'Approved' ? 'Đã hoàn tất (100%)' :
             currentStatus?.status === 'Pending' ? 'Đang đối soát (75%)' :
             (frontImageUrl && backImageUrl) ? 'Sẵn sàng nộp (50%)' : 'Chờ tải lên (25%)'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-medium pt-1">
          <div className={`p-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            (frontImageUrl || currentStatus) ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-100 text-slate-500'
          }`}>
            <UploadCloud className="w-3.5 h-3.5" />
            <span>1. Tải lên</span>
          </div>
          <div className={`p-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            (frontImageUrl && backImageUrl) ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-100 text-slate-500'
          }`}>
            <FileCheck className="w-3.5 h-3.5" />
            <span>2. Tiếp nhận</span>
          </div>
          <div className={`p-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            currentStatus?.status === 'Pending' ? 'bg-amber-50 text-amber-700 font-bold' :
            currentStatus?.status === 'Approved' ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-100 text-slate-500'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>3. Đối soát</span>
          </div>
          <div className={`p-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
            currentStatus?.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-500'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Chứng nhận</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'identity' && (
          <motion.div
            key="identity-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6 motion-gpu"
          >
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
                Tất cả các tin đăng của bạn sẽ tự động hiển thị huy hiệu <strong>"Chủ trọ đã xác minh CCCD" (+20 điểm Trust Score)</strong>, giúp nâng cao mức độ uy tín và tăng độ tin cậy với người tìm trọ.
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
              <form onSubmit={handleSubmitIdentity} className="space-y-6">
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
                          {uploadingFront && (
                            <p className="text-caption text-[#2563EB] flex items-center justify-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải lên...
                            </p>
                          )}
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
                          {uploadingBack && (
                            <p className="text-caption text-[#2563EB] flex items-center justify-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải lên...
                            </p>
                          )}
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
        </motion.div>
      )}

      {/* TAB 2: PROPERTY OWNERSHIP (SỔ ĐỎ / SỔ HỒNG) */}
      {activeTab === 'property' && (
        <motion.div
          key="property-tab"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 motion-gpu"
        >
          {/* Benefit Banner */}
          <div className="p-5 rounded-[18px] bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-950">
                Xác thực Chủ quyền Bất động sản (+20 điểm DORMI Trust Score)
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Khi Ban quản trị duyệt hồ sơ Sổ đỏ/Sổ hồng hoặc Giấy ủy quyền quản lý, căn phòng của bạn sẽ được kích hoạt huy hiệu <strong>"Sổ đỏ/Chủ quyền đã xác thực"</strong>. Khách thuê sẵn sàng nộp hồ sơ và ký hợp đồng nhanh hơn gấp 3 lần.
              </p>
            </div>
          </div>

          {propertySubmittedSuccess ? (
            <Card className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-[18px] p-6 space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <FileCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-h3 font-bold text-slate-900">Đã tiếp nhận hồ sơ xác minh chủ quyền!</h3>
                <p className="text-body text-slate-600 max-w-md mx-auto">
                  Hồ sơ giấy tờ của căn phòng đã được chuyển tới bộ phận thẩm định pháp lý DORMI. Kết quả đối soát sẽ có trong vòng 24 giờ.
                </p>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => setPropertySubmittedSuccess(false)}
                className="mx-auto"
              >
                Gửi xác thực cho phòng trọ khác
              </Button>
            </Card>
          ) : (
            <Card className="bg-white rounded-[18px] shadow-clay-soft p-8 border-none space-y-6">
              <form onSubmit={handleSubmitProperty} className="space-y-6">
                {/* Room selector */}
                <div>
                  <label className="block text-caption font-semibold text-[#0F172A] mb-1.5">
                    Chọn phòng trọ cần chứng thực chủ quyền
                  </label>
                  {myRooms.length > 0 ? (
                    <select
                      className="w-full px-4 py-2.5 rounded-[12px] border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] bg-[#F8FAFC] text-body"
                      value={selectedRoomId}
                      onChange={e => handleRoomChange(e.target.value)}
                    >
                      {myRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.title} - {room.address} {room.isPropertyVerified ? '(Đã xác minh)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-rose-600 italic">
                      Bạn chưa tạo phòng trọ nào. Vui lòng tạo tin đăng phòng trước khi nộp hồ sơ chủ quyền.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-caption font-semibold text-[#0F172A] mb-1.5">Loại tài liệu pháp lý</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-[12px] border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] bg-[#F8FAFC] text-body"
                      value={propDocType}
                      onChange={e => setPropDocType(e.target.value)}
                    >
                      <option value="PropertyCertificate">Sổ đỏ / Sổ hồng (Giấy chứng nhận QSD đất & nhà ở)</option>
                      <option value="SalesContract">Hợp đồng mua bán căn hộ / Nhà ở thương mại</option>
                      <option value="PowerOfAttorney">Hợp đồng ủy quyền quản lý & cho thuê công chứng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption font-semibold text-[#0F172A] mb-1.5">Số sê-ri / Số công chứng hợp đồng</label>
                    <Input
                      placeholder="Ví dụ: BD 123456 hoặc 01/2026/HĐUQ"
                      value={propDocNumber}
                      onChange={e => setPropDocNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-caption font-semibold text-[#0F172A] mb-1.5">Địa chỉ thửa đất / Căn hộ ghi trên giấy tờ</label>
                  <Input
                    placeholder="Địa chỉ cụ thể theo giấy tờ chứng nhận"
                    value={propAddress}
                    onChange={e => setPropAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Trang 1 / Bìa sổ */}
                  <div className="space-y-2">
                    <label className="block text-caption font-semibold text-[#0F172A]">Ảnh trang 1 (Bìa sổ / Trang thông tin chủ)</label>
                    <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-4 text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors relative">
                      {propFrontUrl ? (
                        <div className="relative group">
                          <img src={propFrontUrl} alt="Prop Front" className="w-full h-40 object-cover rounded-[10px]" />
                          <button
                            type="button"
                            onClick={() => setPropFrontUrl('')}
                            className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-full text-xs hover:bg-[#B91C1C] transition-colors"
                            aria-label="Xóa ảnh mặt trước"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center gap-2">
                          <UploadCloud className="w-8 h-8 text-[#94A3B8]" />
                          <p className="text-caption text-[#64748B]">Tải lên trang bìa / thông tin chủ quyền</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handlePropFileUpload(e, 'front')}
                            disabled={uploadingPropFront}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {uploadingPropFront && (
                            <p className="text-caption text-[#2563EB] flex items-center justify-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải lên...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trang sơ đồ / Trang nội dung */}
                  <div className="space-y-2">
                    <label className="block text-caption font-semibold text-[#0F172A]">Ảnh trang sơ đồ thửa đất / Nội dung phê duyệt</label>
                    <div className="border-2 border-dashed border-[#CBD5E1] rounded-[14px] p-4 text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors relative">
                      {propBackUrl ? (
                        <div className="relative group">
                          <img src={propBackUrl} alt="Prop Back" className="w-full h-40 object-cover rounded-[10px]" />
                          <button
                            type="button"
                            onClick={() => setPropBackUrl('')}
                            className="absolute top-2 right-2 bg-[#DC2626] text-white p-1 rounded-full text-xs hover:bg-[#B91C1C] transition-colors"
                            aria-label="Xóa ảnh mặt sau"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-6 flex flex-col items-center gap-2">
                          <UploadCloud className="w-8 h-8 text-[#94A3B8]" />
                          <p className="text-caption text-[#64748B]">Tải lên trang sơ đồ / nội dung chi tiết</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handlePropFileUpload(e, 'back')}
                            disabled={uploadingPropBack}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {uploadingPropBack && (
                            <p className="text-caption text-[#2563EB] flex items-center justify-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải lên...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>DORMI bảo mật thông tin pháp lý theo tiêu chuẩn ngân hàng; ảnh giấy tờ chỉ dùng để thẩm định và không công khai cho người dùng khác.</span>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submittingProperty || !propFrontUrl || !propBackUrl || !propDocNumber || !propAddress}
                    className="px-8 shadow-clay-soft bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submittingProperty ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ xác minh Chủ quyền Sổ đỏ (+20 điểm)'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
