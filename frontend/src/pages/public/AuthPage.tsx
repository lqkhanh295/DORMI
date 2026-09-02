import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useStore, type Role } from '../../store/useStore';

export default function AuthPage() {
  const [role, setRole] = useState<Role>('Tenant');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const login = useStore(state => state.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role, email || 'user@example.com');
    if (role === 'Tenant') navigate('/tenant');
    else if (role === 'Landlord') navigate('/landlord');
    else if (role === 'Admin') navigate('/admin');
    else navigate('/');
  };

  // ponytail: AuthPage using Functional Clay (Level 1 Primary Clay card & Deep Navy toggles)
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <Card className="w-full max-w-md p-8 bg-white rounded-[18px] shadow-clay-primary border-none">
        <div className="text-center mb-8">
          <h2 className="text-h2 font-bold text-[#0F172A]">Chào mừng trở lại</h2>
          <p className="text-body text-[#64748B] mt-2">Vui lòng chọn vai trò để tiếp tục.</p>
        </div>

        <div className="flex p-1 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] mb-8">
          <button 
            type="button"
            className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all min-h-[44px] ${role === 'Tenant' ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            onClick={() => setRole('Tenant')}
          >
            Người thuê
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all min-h-[44px] ${role === 'Landlord' ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            onClick={() => setRole('Landlord')}
          >
            Chủ nhà
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all min-h-[44px] ${role === 'Admin' ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            onClick={() => setRole('Admin')}
          >
            Quản trị viên
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Địa chỉ Email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input label="Mật khẩu" type="password" placeholder="••••••••" required />
          <Button type="submit" fullWidth className="min-h-[44px]">Đăng nhập với vai trò {role === 'Tenant' ? 'Người thuê' : role === 'Landlord' ? 'Chủ nhà' : 'Quản trị'}</Button>
        </form>
      </Card>
    </div>
  );
}
