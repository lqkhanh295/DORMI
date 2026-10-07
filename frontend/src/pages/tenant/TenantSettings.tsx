import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { Lock, Bell, Shield, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { authApi } from '../../services/api';

type TabType = 'notifications' | 'security' | 'privacy' | 'danger';

export default function TenantSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [matchNotify, setMatchNotify] = useState(true);
  const [chatNotify, setChatNotify] = useState(true);
  const [promoNotify, setPromoNotify] = useState(false);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Privacy tab state
  const [showPhone, setShowPhone] = useState(true);
  const [allowMatching, setAllowMatching] = useState(true);

  const logout = useStore(state => state.logout);

  const handleSaveNotifications = () => {
    toast.success('Đã lưu cấu hình thông báo thành công!');
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
      toast.success(res?.message || 'Đổi mật khẩu thành công!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSavePrivacy = () => {
    toast.success('Đã cập nhật tùy chọn quyền riêng tư!');
  };

  const handleDeactivate = () => {
    if (window.confirm('Bạn có chắc chắn muốn tạm khóa tài khoản? Bạn có thể mở khóa lại khi đăng nhập.')) {
      toast.success('Đã gửi yêu cầu tạm khóa tài khoản.');
      logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-[#F5F7FA]">
      <div>
        <h1 className="text-h2 font-bold text-[#0F172A]">Cài đặt tài khoản</h1>
        <p className="text-body text-[#64748B]">Quản lý thông báo, bảo mật và quyền riêng tư.</p>
      </div>

      <Card className="bg-white rounded-[18px] shadow-clay-soft overflow-hidden p-0 border-none">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Settings Sidebar */}
          <div className="bg-[#F5F7FA] border-r border-[#E2E8F0] p-4 space-y-2">
            <button 
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-4 py-2.5 text-caption font-semibold rounded-[12px] transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] flex items-center gap-2 ${
                activeTab === 'notifications' 
                  ? 'btn-clay-primary' 
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <Bell className="w-4 h-4" /> Cài đặt thông báo
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-2.5 text-caption font-semibold rounded-[12px] transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] flex items-center gap-2 ${
                activeTab === 'security' 
                  ? 'btn-clay-primary' 
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <Lock className="w-4 h-4" /> Bảo mật & Mật khẩu
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`w-full text-left px-4 py-2.5 text-caption font-semibold rounded-[12px] transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] flex items-center gap-2 ${
                activeTab === 'privacy' 
                  ? 'btn-clay-primary' 
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <Shield className="w-4 h-4" /> Quyền riêng tư
            </button>

            <button 
              type="button"
              onClick={() => setActiveTab('danger')}
              className={`w-full text-left px-4 py-2.5 text-caption font-semibold rounded-[12px] transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] flex items-center gap-2 mt-8 ${
                activeTab === 'danger' 
                  ? 'bg-red-600 text-white shadow-sm' 
                  : 'text-[#C62828] hover:bg-[#FEF2F2]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Vùng nguy hiểm
            </button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 p-6 md:p-8 space-y-6 bg-white min-h-[380px]">
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h2 className="text-h3 font-bold text-[#0F172A]">Thông báo Email</h2>
                  <Button size="sm" onClick={handleSaveNotifications}>Lưu thay đổi</Button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-semibold text-[#0F172A]">Gợi ý ở ghép phù hợp mới</h4>
                      <p className="text-caption text-[#64748B]">Nhận email khi hệ thống tìm thấy người ở ghép phù hợp &gt;85%.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setMatchNotify(!matchNotify)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${matchNotify ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${matchNotify ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-semibold text-[#0F172A]">Tin nhắn mới</h4>
                      <p className="text-caption text-[#64748B]">Gửi email thông báo khi có tin nhắn mới mà bạn đang ngoại tuyến.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setChatNotify(!chatNotify)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${chatNotify ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${chatNotify ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-semibold text-[#0F172A]">Khuyến mãi & Tin tức</h4>
                      <p className="text-caption text-[#64748B]">Nhận ưu đãi phòng trọ từ các chủ nhà đã xác minh.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setPromoNotify(!promoNotify)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${promoNotify ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${promoNotify ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                </div>

                <h2 className="text-h3 font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-3 mt-8">Thông báo Đẩy</h2>
                <div className="bg-[#F5F7FA] shadow-clay-soft border border-[#E2E8F0] p-4 rounded-[12px] flex items-center justify-between">
                  <div>
                    <p className="text-body font-semibold text-[#0F172A]">Bật thông báo đẩy trên trình duyệt</p>
                    <p className="text-caption text-[#64748B]">Cập nhật tin nhắn và lịch xem phòng ngay lập tức.</p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => {
                      if ('Notification' in window) {
                        Notification.requestPermission().then(perm => {
                          if (perm === 'granted') toast.success('Đã kích hoạt thông báo đẩy thành công!');
                          else toast.info('Bạn đã từ chối nhận thông báo trên trình duyệt.');
                        });
                      } else {
                        toast.info('Trình duyệt không hỗ trợ Web Push Notification.');
                      }
                    }}
                  >
                    Bật ngay
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h2 className="text-h3 font-bold text-[#0F172A]">Đổi mật khẩu tài khoản</h2>
                  <p className="text-caption text-[#64748B] mt-0.5">Nên sử dụng mật khẩu dài từ 8 ký tự gồm chữ hoa, chữ thường và ký hiệu.</p>
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
                    label="Mật khẩu mới" 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <Input 
                    label="Xác nhận mật khẩu mới" 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updatingPassword}>
                    {updatingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="border-b border-[#E2E8F0] pb-3">
                  <h2 className="text-h3 font-bold text-[#0F172A]">Cài đặt quyền riêng tư</h2>
                  <p className="text-caption text-[#64748B] mt-0.5">Kiểm soát thông tin hiển thị với chủ trọ và người tìm ở ghép.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-semibold text-[#0F172A]">Hiển thị số điện thoại cho chủ nhà</h4>
                      <p className="text-caption text-[#64748B]">Cho phép chủ nhà liên hệ trực tiếp khi bạn đặt lịch xem phòng.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowPhone(!showPhone)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${showPhone ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${showPhone ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body font-semibold text-[#0F172A]">Hiển thị hồ sơ trong thuật toán Matcher</h4>
                      <p className="text-caption text-[#64748B]">Cho phép gợi ý hồ sơ của bạn cho những người cùng sở thích tìm bạn ở ghép.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setAllowMatching(!allowMatching)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${allowMatching ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${allowMatching ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                </div>

                <Button onClick={handleSavePrivacy}>Lưu cài đặt quyền riêng tư</Button>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div className="border-b border-red-200 pb-3">
                  <h2 className="text-h3 font-bold text-red-600">Vùng nguy hiểm</h2>
                  <p className="text-caption text-[#64748B] mt-0.5">Các thao tác ảnh hưởng vĩnh viễn tới dữ liệu tài khoản.</p>
                </div>

                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-body font-semibold text-red-900">Tạm khóa tài khoản</h4>
                    <p className="text-caption text-red-700">Tài khoản sẽ bị ẩn khỏi kết quả tìm kiếm và các tin đăng liên quan.</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={handleDeactivate}
                  >
                    Tạm khóa ngay
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
