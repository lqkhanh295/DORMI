import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.resetPassword({ email, newPassword });
      setMessage(res.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <Card className="w-full max-w-md p-8 bg-white shadow-clay-soft rounded-[20px]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#EEF2F6] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Đặt lại Mật khẩu</h2>
          <p className="text-[#64748B] text-sm mt-2">
            {step === 1 
              ? 'Nhập địa chỉ email tài khoản DORMI của bạn để bắt đầu đặt lại mật khẩu.'
              : `Nhập mật khẩu mới cho tài khoản: ${email}`}
          </p>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-4">
            <Link to="/auth">
              <Button fullWidth>Đăng nhập với Mật khẩu mới</Button>
            </Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-5">
            <Input 
              label="Địa chỉ Email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-5">
            <Input 
              label="Mật khẩu mới (ít nhất 6 ký tự)" 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Xác nhận Đặt lại Mật khẩu'}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/auth" className="text-sm font-medium text-[#00153D] hover:underline transition-all flex items-center justify-center gap-1">
            <span>←</span> Quay lại Đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
}
