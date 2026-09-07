import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useStore, type Role } from '../../store/useStore';
import { authApi } from '../../services/api';

export default function AuthPage() {
  const [role, setRole] = useState<Role>('Tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const login = useStore(state => state.login);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const targetEmail = (email.trim() || getDefaultEmail(role)).toLowerCase();
    const targetPassword = password.trim() || 'Password123!';

    try {
      if (isRegister) {
        const roleEnum = role === 'Landlord' ? 1 : (role === 'Admin' ? 2 : 0);
        await authApi.register({
          email: targetEmail,
          password: targetPassword,
          fullName: fullName.trim() || (role === 'Landlord' ? 'Lê Văn B' : (role === 'Admin' ? 'Quản trị viên System' : 'Nguyễn Văn A')),
          role: roleEnum
        });
      }

      const apiSuccess = await loginWithApi(targetEmail, targetPassword);
      if (!apiSuccess) {
        login(role, targetEmail);
      }

      if (role === 'Tenant') navigate('/tenant');
      else if (role === 'Landlord') navigate('/landlord');
      else if (role === 'Admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Xử lý đăng nhập thất bại. Đang mở tài khoản dự phòng.');
      login(role, targetEmail);
      if (role === 'Tenant') navigate('/tenant');
      else if (role === 'Landlord') navigate('/landlord');
      else if (role === 'Admin') navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <Card className="w-full max-w-md p-8 bg-white rounded-[18px] shadow-clay-primary border-none">
        <div className="text-center mb-6">
          <h2 className="text-h2 font-bold text-[#0F172A]">
            {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
          </h2>
          <p className="text-body text-[#64748B] mt-2">Chọn vai trò để đăng nhập vào Backend API.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-caption font-semibold">
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
              placeholder="Nguyễn Văn A" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <Input 
            label="Địa chỉ Email" 
            type="email" 
            placeholder={getDefaultEmail(role)} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input 
            label="Mật khẩu" 
            type="password" 
            placeholder="Password123!" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" fullWidth disabled={loading} className="min-h-[44px]">
            {loading ? 'Đang kết nối API...' : isRegister ? 'Đăng ký ngay' : `Đăng nhập (${role})`}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-[#F5F7FA] rounded-[12px] text-caption text-[#64748B] space-y-1">
          <p className="font-bold text-[#0F172A]">Tài khoản Backend mẫu:</p>
          <p>Email: <span className="font-mono text-[#00153D]">{getDefaultEmail(role)}</span></p>
          <p>Mật khẩu: <span className="font-mono text-[#00153D]">Password123!</span></p>
        </div>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-caption text-primary hover:underline font-semibold"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>
      </Card>
    </div>
  );
}
