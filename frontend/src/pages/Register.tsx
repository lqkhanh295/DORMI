import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { User, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'customer' | 'landlord' | null>(null);

  const handleContinue = () => {
    if (role === 'customer') {
      navigate('/customer/dashboard'); // Mock
    } else if (role === 'landlord') {
      navigate('/landlord/dashboard'); // Mock
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Đăng ký tài khoản</h1>
          <p className="text-foreground/70">Chọn vai trò của bạn để tiếp tục</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div 
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 flex flex-col items-center text-center gap-4 ${
              role === 'customer' 
                ? 'border-primary bg-primary/10 shadow-sm' 
                : 'border-white/40 bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => setRole('customer')}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${role === 'customer' ? 'bg-primary text-white' : 'bg-white/50 text-foreground/50'}`}>
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Người thuê</h3>
              <p className="text-sm text-foreground/70">Tìm kiếm phòng trọ và người ở ghép phù hợp.</p>
            </div>
          </div>

          <div 
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 flex flex-col items-center text-center gap-4 ${
              role === 'landlord' 
                ? 'border-primary bg-primary/10 shadow-sm' 
                : 'border-white/40 bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => setRole('landlord')}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${role === 'landlord' ? 'bg-primary text-white' : 'bg-white/50 text-foreground/50'}`}>
              <Home className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Chủ trọ</h3>
              <p className="text-sm text-foreground/70">Đăng phòng, quản lý người thuê và lịch hẹn.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <GlassButton 
            size="lg" 
            className="w-full max-w-sm" 
            disabled={!role}
            onClick={handleContinue}
          >
            Tiếp tục
          </GlassButton>
          
          <div className="text-sm text-foreground/70">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
