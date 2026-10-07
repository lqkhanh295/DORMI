import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../services/api';
import { Lock, ArrowLeft, Mail, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { PageMotion } from '../../components/common/Motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleStep1RequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message || 'Mã OTP đặt lại mật khẩu đã được gửi đến hộp thư của bạn.');
      setCooldown(60);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || !email) return;
    setResending(true);
    setError(null);
    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message || 'Mã OTP mới đã được gửi đến hộp thư của bạn.');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
    } finally {
      setResending(false);
    }
  };

  const handleStep2VerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyOtp({ email, otp: cleanOtp });
      setResetToken(res.resetToken);
      setMessage(res.message || 'Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.');
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3ResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.resetPassword({ resetToken, newPassword });
      setMessage(res.message || 'Đặt lại mật khẩu thành công!');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thực hiện lại từ đầu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageMotion className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <Card className="w-full max-w-md p-8 bg-white shadow-clay-soft rounded-[20px]">
        {/* Step Indicator */}
        {!success && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
              step === 1 ? 'bg-[#00153D] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
            }`}>
              1
            </span>
            <div className={`w-8 h-0.5 transition-colors duration-200 ${step >= 2 ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`} />
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
              step === 2 ? 'bg-[#00153D] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
            }`}>
              2
            </span>
            <div className={`w-8 h-0.5 transition-colors duration-200 ${step >= 3 ? 'bg-[#00153D]' : 'bg-[#E2E8F0]'}`} />
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
              step === 3 ? 'bg-[#00153D] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
            }`}>
              3
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#EEF2F6] text-[#00153D] rounded-full flex items-center justify-center mx-auto mb-4">
            {success ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : step === 1 ? (
              <Mail className="w-7 h-7" />
            ) : step === 2 ? (
              <KeyRound className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">
            {success ? 'Thành công!' : step === 1 ? 'Quên Mật khẩu' : step === 2 ? 'Xác thực mã OTP' : 'Đặt lại Mật khẩu mới'}
          </h2>
          <p className="text-[#64748B] text-sm mt-2">
            {success
              ? 'Mật khẩu của bạn đã được cập nhật an toàn.'
              : step === 1 
              ? 'Nhập địa chỉ email tài khoản DORMI của bạn để nhận mã OTP xác thực.'
              : step === 2
              ? `Nhập mã 6 chữ số đã được gửi đến hộp thư: ${email}`
              : 'Thiết lập mật khẩu mới có ít nhất 6 ký tự để bảo vệ tài khoản.'}
          </p>
        </div>

        {message && !success && (
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
          <div className="text-center py-4 space-y-4">
            <p className="text-sm text-[#475569]">
              Bạn có thể sử dụng mật khẩu mới ngay bây giờ để truy cập tài khoản.
            </p>
            <Link to="/auth">
              <Button fullWidth>Đăng nhập ngay</Button>
            </Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleStep1RequestOtp} className="space-y-5">
            <Input 
              label="Địa chỉ Email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Đang gửi mã...' : 'Nhận mã OTP'}
            </Button>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleStep2VerifyOtp} className="space-y-5">
            <div>
              <Input 
                label="Mã xác thực OTP (6 chữ số)" 
                type="text" 
                placeholder="123456" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required 
              />
              <p className="text-xs text-[#64748B] mt-1.5">
                Mã OTP có hiệu lực trong 5 phút. Tối đa 5 lần thử.
              </p>
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác nhận mã OTP'}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="text-xs font-medium text-[#00153D] hover:underline disabled:text-[#94A3B8] disabled:no-underline inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : 'Gửi lại mã OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStep3ResetPassword} className="space-y-5">
            <Input 
              label="Mật khẩu mới (ít nhất 6 ký tự)" 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
            <Input 
              label="Xác nhận mật khẩu mới" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Xác nhận Đặt lại Mật khẩu'}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/auth" className="text-sm font-medium text-[#00153D] hover:underline transition-colors inline-flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
          </Link>
        </div>
      </Card>
    </PageMotion>
  );
}
