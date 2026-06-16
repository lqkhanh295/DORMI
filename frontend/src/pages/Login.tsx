import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import { GlassButton } from '../components/ui/GlassButton';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập đăng nhập thành công, chuyển hướng đến Customer Dashboard
    navigate('/customer/dashboard');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Đăng nhập</h1>
          <p className="text-foreground/70">Chào mừng bạn quay trở lại DORMI</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <GlassInput 
            label="Email"
            type="email"
            placeholder="nhapemail@example.com"
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
            <a href="#" className="text-sm text-primary hover:underline">Quên mật khẩu?</a>
          </div>

          <GlassButton type="submit" size="lg" className="w-full mt-2">
            Đăng nhập
          </GlassButton>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/70">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
