import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { profilesApi, authApi } from '../../services/api';
import { toast } from 'sonner';
import { 
  Lock, 
  ShieldCheck, 
  Phone, 
  Scale
} from 'lucide-react';

export default function LandlordSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'legal'>('profile');
  const [phoneNumber, setPhoneNumber] = useState('0901234567');
  const [loading, setLoading] = useState(true);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;
    profilesApi.getLandlordProfile()
      .then(res => {
        if (!isMounted) return;
        if (res?.phoneNumber) {
          setPhoneNumber(res.phoneNumber);
        }
      })
      .catch((err) => {
        console.warn('profilesApi.getLandlordProfile failed:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profilesApi.updateLandlordProfile({ phoneNumber });
      toast.success('Đã cập nhật số điện thoại!');
    } catch {
      toast.error('Không thể lưu cài đặt.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(res?.message || 'Đã đổi mật khẩu!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-[#F8FAFC]">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Cài đặt tài khoản Chủ trọ</h1>
        <p className="text-sm text-[#64748B]">Quản lý thông tin liên lạc, bảo mật đăng nhập và chính sách quyền riêng tư.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#00153D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Thông tin liên hệ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'security'
                ? 'bg-[#00153D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Bảo mật & Mật khẩu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
              activeTab === 'legal'
                ? 'bg-[#00153D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Chính sách & Pháp lý</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3">
          <Card className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">Số điện thoại liên lạc</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Số điện thoại này sẽ được gửi cho khách thuê khi họ đặt lịch hẹn xem phòng.</p>
                </div>

                <div className="max-w-md space-y-4">
                  <Input 
                    label="Số điện thoại chính thức" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    placeholder="VD: 0901234567"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" className="text-xs px-6" disabled={loading}>
                    Lưu số điện thoại
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">Đổi mật khẩu tài khoản</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Mật khẩu an toàn giúp bảo vệ danh sách phòng trọ và dữ liệu hợp đồng của bạn.</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <Input 
                    label="Mật khẩu hiện tại" 
                    type="password" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Input 
                    label="Mật khẩu mới (Tối thiểu 6 ký tự)" 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <Input 
                    label="Xác nhận lại mật khẩu mới" 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updatingPassword} className="text-xs px-6">
                    {updatingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 3: LEGAL & PRIVACY POLICY */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">Chính sách bảo mật & Điều khoản dịch vụ</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Quy định bảo vệ dữ liệu cá nhân của Chủ trọ và Khách thuê trên DORMI.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
                    <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Bảo vệ hồ sơ định danh CCCD Chủ trọ:
                    </p>
                    <p>
                      Mọi giấy tờ tùy thân CCCD và giấy chứng nhận sở hữu phòng trọ của bạn chỉ phục vụ mục đích kiểm duyệt nội bộ và cấp tích xanh chính chủ. DORMI cam kết không bao giờ công khai ảnh chụp giấy tờ tùy thân của bạn ra bên ngoài.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                        <Scale className="w-4 h-4 text-blue-600" />
                        <span>Điều khoản Dịch vụ</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Quy định quyền lợi, nghĩa vụ đăng tin, quy tắc bàn giao tài sản và thỏa thuận hợp đồng điện tử.
                      </p>
                      <Link 
                        to="/terms"
                        target="_blank"
                        className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Đọc toàn văn Điều khoản →
                      </Link>
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>Chính sách Bảo mật</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Cam kết tuân thủ Nghị định 13/2023/NĐ-CP về an toàn dữ liệu, quyền đối với dữ liệu và cổng PayOS.
                      </p>
                      <Link 
                        to="/privacy"
                        target="_blank"
                        className="text-xs text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Đọc Chính sách bảo mật →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </Card>
        </div>

      </div>
    </div>
  );
}
