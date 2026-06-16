import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    navigate('/customer/dashboard');
  };

  return (
    <div className="section-shell flex flex-1 items-center justify-center py-16">
      <GlassCard tone="solid" className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">Chào mừng trở lại</p>
          <h1 className="text-3xl font-extrabold text-foreground">Đăng nhập DORMI</h1>
          <p className="mt-2 text-muted">Tiếp tục tìm phòng, lưu lịch hẹn và nhắn với chủ phòng.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <GlassInput
            label="Email"
            type="email"
            placeholder="ban@example.com"
            leftIcon={<Mail className="w-5 h-5" />}
            required
          />
          <GlassInput
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-5 h-5" />}
            required
          />

          <div className="flex justify-end">
            <a href="#" className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu?</a>
          </div>

          <GlassButton type="submit" size="lg" className="w-full">
            Đăng nhập
          </GlassButton>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
