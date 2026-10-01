import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useStore, type Role } from '../../store/useStore';
import { authApi } from '../../services/api';
import { 
  Sparkles, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  KeyRound, 
  ArrowLeft, 
  Clock 
} from 'lucide-react';

export default function AuthPage() {
  const [role, setRole] = useState<Role>('Tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Security, Attempt Limit & Rate Limit states
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // 2FA / MFA verification states
  const [mfaSessionToken, setMfaSessionToken] = useState('');
  const [mfaOtp, setMfaOtp] = useState('');
  const [mfaHint, setMfaHint] = useState('');

  const navigate = useNavigate();
  const loginWithApi = useStore(state => state.loginWithApi);
  const verifyMfaWithApi = useStore(state => state.verifyMfaWithApi);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutSeconds || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const getDefaultEmail = (selectedRole: Role) => {
    if (selectedRole === 'Landlord') return 'landlord@dormi.vn';
    if (selectedRole === 'Admin') return 'admin@dormi.vn';
    return 'tenant@dormi.vn';
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setErrorMsg('');
    setRemainingAttempts(null);
  };

  const handleFillDemo = () => {
    setEmail(getDefaultEmail(role));
    setPassword('Password123!');
    if (isRegister) {
      setFullName(role === 'Landlord' ? 'Trần Minh Tuấn' : (role === 'Admin' ? 'Quản trị viên Dormi' : 'Nguyễn Văn An'));
    }
  };

  const handleRefreshCaptcha = async () => {
    try {
      const challenge = await authApi.getCaptcha();
      if (challenge?.captchaToken) {
        setCaptchaToken(challenge.captchaToken);
        setCaptchaQuestion(challenge.question);
        setCaptchaAnswer('');
      }
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutSeconds && lockoutSeconds > 0) {
      setErrorMsg(`Tài khoản đang bị tạm khóa an toàn. Vui lòng thử lại sau ${Math.ceil(lockoutSeconds / 60)} phút.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ địa chỉ Email và Mật khẩu.');
      return;
    }

    if (isRegister && !fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và Tên khi đăng ký tài khoản.');
      return;
    }

    if (requiresCaptcha && !captchaAnswer.trim()) {
      setErrorMsg('Vui lòng hoàn thành câu hỏi mã bảo vệ (CAPTCHA) trước khi tiếp tục.');
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

      const res = await loginWithApi(
        targetEmail, 
        targetPassword, 
        requiresCaptcha ? captchaToken : undefined, 
        requiresCaptcha ? captchaAnswer.trim() : undefined
      );

      // Check if MFA (2-Factor Authentication) is required
      if (res?.requiresMfa) {
        setStep('mfa');
        setMfaSessionToken(res.mfaSessionToken || '');
        setMfaHint(res.message || 'Mã xác thực OTP đã được tạo (hiệu lực 5 phút).');
        setErrorMsg('');
        setLoading(false);
        return;
      }

      // Successful standard login
      if (role === 'Tenant') navigate('/tenant');
      else if (role === 'Landlord') navigate('/landlord');
      else if (role === 'Admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      const data = err.data;
      if (data?.lockoutSeconds) {
        setLockoutSeconds(data.lockoutSeconds);
      }
      if (typeof data?.remainingAttempts === 'number') {
        setRemainingAttempts(data.remainingAttempts);
      }
      if (data?.requiresCaptcha) {
        setRequiresCaptcha(true);
        setCaptchaToken(data.captchaToken || '');
        setCaptchaQuestion(data.captchaQuestion || '');
        setCaptchaAnswer('');
      }
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaOtp.trim()) {
      setErrorMsg('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await verifyMfaWithApi(email.trim().toLowerCase(), mfaSessionToken, mfaOtp.trim());
      if (role === 'Tenant') navigate('/tenant');
      else if (role === 'Landlord') navigate('/landlord');
      else if (role === 'Admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã OTP xác thực không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <Card className="w-full max-w-md p-8 bg-white rounded-[18px] shadow-clay-primary border-none">
        
        {/* Step: MFA / 2FA Verification */}
        {step === 'mfa' ? (
          <div>
            <button
              type="button"
              onClick={() => { setStep('login'); setErrorMsg(''); }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại form đăng nhập
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00153D] flex items-center justify-center mx-auto mb-3 shadow-clay-card">
                <KeyRound className="w-6 h-6 text-[#00153D]" />
              </div>
              <h2 className="text-h2 font-bold text-[#0F172A]">Xác thực 2 bước (MFA)</h2>
              <p className="text-body text-[#64748B] mt-1.5 text-xs">
                Tài khoản được bảo vệ bằng xác thực đa yếu tố. Vui lòng nhập mã OTP 6 số để tiếp tục.
              </p>
            </div>

            {mfaHint && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{mfaHint}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-caption font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <div>
                <label className="text-caption font-semibold text-[#0F172A] block mb-1">
                  Mã xác thực OTP (6 chữ số)
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Ví dụ: 123456"
                  value={mfaOtp}
                  onChange={(e) => setMfaOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  className="text-center text-lg tracking-widest font-mono font-bold"
                />
              </div>

              <Button type="submit" fullWidth disabled={loading || mfaOtp.length < 6} className="min-h-[44px]">
                {loading ? 'Đang xác thực...' : 'Xác nhận OTP & Đăng nhập'}
              </Button>
            </form>
          </div>
        ) : (
          /* Step: Standard Login / Register */
          <div>
            <div className="text-center mb-6">
              <h2 className="text-h2 font-bold text-[#0F172A]">
                {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
              </h2>
              <p className="text-body text-[#64748B] mt-2">Chọn vai trò để đăng nhập vào hệ thống Dormi.</p>
            </div>

            {/* Lockout Warning Banner */}
            {lockoutSeconds !== null && lockoutSeconds > 0 && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">Tài khoản đang bị tạm khóa an toàn</p>
                  <p className="mt-1 flex items-center gap-1 text-red-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-red-600" /> Thời gian mở khóa: 
                    <span className="font-mono font-bold text-red-900 ml-1">
                      {Math.floor(lockoutSeconds / 60)} phút {lockoutSeconds % 60} giây
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Remaining Attempts Warning */}
            {remainingAttempts !== null && remainingAttempts < 5 && (!lockoutSeconds || lockoutSeconds <= 0) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Cảnh báo bảo mật: Bạn còn <strong>{remainingAttempts}</strong> lần thử trước khi tài khoản bị khóa tạm thời.
                </span>
              </div>
            )}

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
                onChange={(e) => { setEmail(e.target.value); setRemainingAttempts(null); }}
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

              {/* CAPTCHA / Risk Challenge Box */}
              {requiresCaptcha && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Mã bảo vệ (CAPTCHA):
                    </span>
                    <button
                      type="button"
                      onClick={handleRefreshCaptcha}
                      className="text-blue-700 hover:text-blue-900 flex items-center gap-1 text-[11px] font-medium"
                    >
                      <RefreshCw className="w-3 h-3" /> Đổi câu hỏi
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-800 text-sm tracking-wider select-none min-w-[90px] text-center shadow-xs">
                      {captchaQuestion || '...'}
                    </div>
                    <Input
                      type="text"
                      placeholder="Nhập kết quả số"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)} 
                className="min-h-[44px]"
              >
                {loading ? 'Đang xác thực an toàn...' : isRegister ? 'Đăng ký ngay' : `Đăng nhập (${role})`}
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
                onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); setRemainingAttempts(null); }} 
                className="text-caption text-primary hover:underline font-semibold"
              >
                {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
