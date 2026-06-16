import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { GlassCard } from '../components/ui/GlassCard';

export function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'customer' | 'landlord' | null>(null);

  const handleContinue = () => {
    if (role === 'customer') navigate('/customer/dashboard');
    if (role === 'landlord') navigate('/landlord/dashboard');
  };

  return (
    <div className="section-shell flex flex-1 items-center justify-center py-16">
      <GlassCard tone="solid" className="w-full max-w-3xl p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">Bắt đầu</p>
          <h1 className="text-3xl font-extrabold text-foreground">Bạn dùng DORMI với vai trò nào?</h1>
          <p className="mt-2 text-muted">Chọn đúng vai trò để DORMI mở dashboard phù hợp cho bạn.</p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            className={`rounded-2xl border p-6 text-left transition-all ${
              role === 'customer'
                ? 'border-primary bg-primary/8 shadow-[0_18px_40px_rgba(21,94,239,0.12)]'
                : 'border-line bg-surface hover:border-primary/30 hover:bg-cyan-50'
            }`}
            onClick={() => setRole('customer')}
          >
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${role === 'customer' ? 'bg-primary text-white' : 'bg-cyan-100 text-primary'}`}>
              <User className="w-7 h-7" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold">Người thuê</h3>
            <p className="text-sm leading-6 text-muted">Tìm phòng, lưu lựa chọn, đặt lịch xem phòng và ghép bạn ở cùng.</p>
          </button>

          <button
            type="button"
            className={`rounded-2xl border p-6 text-left transition-all ${
              role === 'landlord'
                ? 'border-primary bg-primary/8 shadow-[0_18px_40px_rgba(21,94,239,0.12)]'
                : 'border-line bg-surface hover:border-primary/30 hover:bg-cyan-50'
            }`}
            onClick={() => setRole('landlord')}
          >
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${role === 'landlord' ? 'bg-primary text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <Home className="w-7 h-7" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold">Chủ phòng</h3>
            <p className="text-sm leading-6 text-muted">Đăng phòng, xác minh KYC, quản lý lịch hẹn và tin nhắn từ khách thuê.</p>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <GlassButton size="lg" className="w-full max-w-sm" disabled={!role} onClick={handleContinue}>
            Tiếp tục
          </GlassButton>
          <div className="text-sm text-muted">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
