import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useStore, type Role } from '../../store/useStore';
import { authApi } from '../../services/api';
import { Info, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [role, setRole] = useState<Role>('Tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const loginWithApi = useStore(state => state.loginWithApi);

  const getDefaultEmail = (selectedRole: Role) => {
    if (selectedRole === 'Landlord') return 'landlord@dormi.vn';
    if (selectedRole === 'Admin') return 'admin@dormi.vn';
    return 'tenant@dormi.vn';
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setErrorMsg('');
  };

  const handleFillDemo = () => {
    setEmail(getDefaultEmail(role));
    setPassword('Password123!');
    if (isRegister) {
      setFullName(role === 'Landlord' ? 'Trần Minh Tuấn' : (role === 'Admin' ? 'Quản trị viên Dormi' : 'Nguyễn Văn An'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ địa chỉ Email và Mật khẩu.');
      return;
    }

    if (isRegister && !fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và Tên khi đăng ký tài khoản.');
      return;
    }

    setLoading(true);
    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password.trim();

    try {
      if (isRegister) {
        const roleEnum = role === 'Landlord' ? 1 : (role === 'Admin' ? 2 : 0);
        await authApi.register({
          email: targetEmail,
          password: targetPassword,
          fullName: fullName.trim(),
          role: roleEnum
        });
      }

      const apiSuccess = await loginWithApi(targetEmail, targetPassword);
      if (!apiSuccess) {
        setErrorMsg('Đăng nhập thất bại: Email hoặc mật khẩu không chính xác.');
        return;
      }

      if (role === 'Tenant') navigate('/tenant');
      else if (role === 'Landlord') navigate('/landlord');
      else if (role === 'Admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <Card className="w-full max-w-md p-8 bg-white rounded-[18px] shadow-clay-primary border-none">
        {/* Demo Environment Banner */}
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Môi trường Thử nghiệm MVP:</span> Dữ liệu được đồng bộ trực tiếp với PostgreSQL backend.
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-h2 font-bold text-[#0F172A]">
            {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
          </h2>
          <p className="text-body text-[#64748B] mt-2">Chọn vai trò để đăng nhập vào hệ thống Dormi.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-caption font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}

        <div className="flex p-1 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] mb-6">
          <button 
            type="button"
            className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all min-h-[44px] ${role === 'Tenant' ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            onClick={() => handleRoleSelect('Tenant')}
          >
            Người thuê
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all min-h-[44px] ${role === 'Landlord' ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            onClick={() => handleRoleSelect('Landlord')}
          >
            Chủ nhà
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all min-h-[44px] ${role === 'Admin' ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            onClick={() => handleRoleSelect('Admin')}
          >
            Quản trị
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input 
              label="Họ và Tên" 
              type="text" 
              placeholder="Nhập họ và tên đầy đủ" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <Input 
            label="Địa chỉ Email" 
            type="email" 
            placeholder={`ví dụ: ${getDefaultEmail(role)}`} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-caption font-semibold text-[#0F172A]">Mật khẩu</label>
              {!isRegister && (
                <Link to="/auth/reset" className="text-xs text-[#2563EB] hover:underline">
                  Quên mật khẩu?
                </Link>
              )}
            </div>
            <Input 
              type="password" 
              placeholder="Nhập mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth disabled={loading} className="min-h-[44px]">
            {loading ? 'Đang kết nối API...' : isRegister ? 'Đăng ký ngay' : `Đăng nhập (${role})`}
          </Button>
        </form>

        {/* Explicit Demo Quick Fill */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Tài khoản demo:</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[#2563EB] hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" /> Điền nhanh tài khoản {role} mẫu
          </button>
        </div>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }} 
            className="text-caption text-primary hover:underline font-semibold"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>
      </Card>
    </div>
  );
}
