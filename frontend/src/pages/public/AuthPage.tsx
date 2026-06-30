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

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Chào mừng trở lại</h2>
          <p className="text-gray-500 mt-2">Vui lòng chọn vai trò để tiếp tục.</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-micro ${role === 'Tenant' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            onClick={() => setRole('Tenant')}
          >
            Người thuê
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-micro ${role === 'Landlord' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            onClick={() => setRole('Landlord')}
          >
            Chủ nhà
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-micro ${role === 'Admin' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
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
          <Button type="submit" fullWidth>Đăng nhập với vai trò {role === 'Tenant' ? 'Người thuê' : role === 'Landlord' ? 'Chủ nhà' : 'Quản trị'}</Button>
        </form>
      </Card>
    </div>
  );
}
