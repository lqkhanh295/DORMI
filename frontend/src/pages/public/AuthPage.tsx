import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useStore, type Role } from '../../store/useStore';
import { authApi } from '../../services/api';
import { 
  Home,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  KeyRound,
  Sparkles,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';
import { PageMotion } from '../../components/common/Motion';

// Intentions available for public onboarding
type RegistrationIntention = 'Tenant' | 'Landlord';

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isRegisterParam = searchParams.get('tab') === 'register';
  const [isRegister, setIsRegister] = useState(isRegisterParam);

  // Registration Intention
  const [intention, setIntention] = useState<RegistrationIntention>('Tenant');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // UI & Flow states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [step, setStep] = useState<'login' | 'mfa'>('login');

  // Security, Attempt Limit & Rate Limit states
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
  const location = useLocation();
  const loginWithApi = useStore(state => state.loginWithApi);
  const verifyMfaWithApi = useStore(state => state.verifyMfaWithApi);

  // Sync tab with URL search parameter
  useEffect(() => {
    setIsRegister(searchParams.get('tab') === 'register');
    setErrorMsg('');
  }, [searchParams]);

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

  const toggleTab = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setErrorMsg('');
    setRemainingAttempts(null);
    setSearchParams(registerMode ? { tab: 'register' } : {});
  };

  const handleFillDemo = (demoRole: 'Tenant' | 'Landlord' | 'Admin') => {
    if (demoRole === 'Landlord') {
      setEmail('landlord@dormi.vn');
      setPassword('Password123!');
      setIntention('Landlord');
      if (isRegister) setFullName('Trần Minh Tuấn');
    } else if (demoRole === 'Admin') {
      setEmail('admin@dormi.vn');
      setPassword('Password123!');
      if (isRegister) setFullName('Quản trị viên Dormi');
    } else {
      setEmail('tenant@dormi.vn');
      setPassword('Password123!');
      setIntention('Tenant');
      if (isRegister) setFullName('Nguyễn Văn An');
    }
    setErrorMsg('');
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

  // Safe router based on authoritative server role and preserved destination
  const routeAfterAuth = (userRoleValue: any) => {
    let resolvedRole: Role = 'Tenant';
    if (userRoleValue === 1 || userRoleValue === 'Landlord') resolvedRole = 'Landlord';
    else if (userRoleValue === 2 || userRoleValue === 'Admin') resolvedRole = 'Admin';
    else resolvedRole = 'Tenant';

    const fromLocation = (location.state as any)?.from;
    const targetPath: string | undefined = fromLocation?.pathname;

    // Check if the preserved destination is authorized for this role
    if (targetPath) {
      const isDenied = 
        (targetPath.startsWith('/admin') && resolvedRole !== 'Admin') ||
        (targetPath.startsWith('/landlord') && resolvedRole !== 'Landlord') ||
        (targetPath.startsWith('/tenant') && resolvedRole !== 'Tenant');

      if (!isDenied) {
        navigate(targetPath, { replace: true });
        return;
      }
    }

    // Default workspace per role
    if (resolvedRole === 'Landlord') navigate('/landlord', { replace: true });
    else if (resolvedRole === 'Admin') navigate('/admin', { replace: true });
    else navigate('/tenant', { replace: true });
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
        // Explicitly map intention to allowed public roles (Customer = 0, Landlord = 1)
        const roleEnum = intention === 'Landlord' ? 1 : 0;
        await authApi.register({
          email: targetEmail,
          password: targetPassword,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
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

      // Successful standard login -> route according to authoritative user role
      routeAfterAuth(res?.user?.role);
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
      const res = await verifyMfaWithApi(email.trim().toLowerCase(), mfaSessionToken, mfaOtp.trim());
      routeAfterAuth(res?.user?.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã OTP xác thực không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageMotion className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <Card className="w-full max-w-lg p-8 bg-white rounded-[20px] shadow-clay-primary border-none">
        
        {/* Step: MFA / 2FA Verification */}
        {step === 'mfa' ? (
          <div>
            <button
              type="button"
              onClick={() => { setStep('login'); setErrorMsg(''); }}
              className="inline-flex items-center gap-1.5 text-caption font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại form đăng nhập</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#00153D] flex items-center justify-center mx-auto mb-3 shadow-clay-card">
                <KeyRound className="w-6 h-6 text-[#00153D]" />
              </div>
              <h2 className="text-h2 font-bold text-[#0F172A]">Xác thực 2 bước (MFA)</h2>
              <p className="text-caption text-[#64748B] mt-1.5">
                Tài khoản được bảo vệ bằng xác thực đa yếu tố. Vui lòng nhập mã OTP 6 số để tiếp tục.
              </p>
            </div>

            {mfaHint && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-caption flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{mfaHint}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-caption font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
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
          /* Step: Standard Unified Login / Register */
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-h2 font-bold text-[#0F172A]">
                {isRegister ? 'Tạo tài khoản DORMI' : 'Đăng nhập DORMI'}
              </h1>
              <p className="text-body text-[#64748B] mt-1">
                {isRegister 
                  ? 'Bắt đầu hành trình thuê và quản lý phòng trọ minh bạch.' 
                  : 'Một tài khoản cho toàn bộ hệ sinh thái thuê phòng và quản lý.'}
              </p>
            </div>

            {/* Top Switcher: Đăng nhập vs Đăng ký */}
            <div className="flex p-1 bg-[#F5F7FA] shadow-clay-inset rounded-[14px] mb-6">
              <button 
                type="button"
                className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all duration-150 ease-out active:scale-[0.98] min-h-[42px] ${!isRegister ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                onClick={() => toggleTab(false)}
              >
                Đăng nhập
              </button>
              <button 
                type="button"
                className={`flex-1 py-2.5 text-caption font-semibold rounded-[10px] transition-all duration-150 ease-out active:scale-[0.98] min-h-[42px] ${isRegister ? 'btn-clay-primary' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                onClick={() => toggleTab(true)}
              >
                Đăng ký tài khoản
              </button>
            </div>

            {/* Lockout Warning Banner */}
            {lockoutSeconds !== null && lockoutSeconds > 0 && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-caption flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">Tài khoản đang bị tạm khóa an toàn</p>
                  <p className="mt-1 flex items-center gap-1 text-red-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>Thời gian mở khóa: </span>
                    <span className="font-mono font-bold text-red-900 ml-1">
                      {Math.floor(lockoutSeconds / 60)} phút {lockoutSeconds % 60} giây
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Remaining Attempts Warning */}
            {remainingAttempts !== null && remainingAttempts < 5 && (!lockoutSeconds || lockoutSeconds <= 0) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-caption flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Cảnh báo bảo mật: Bạn còn <strong>{remainingAttempts}</strong> lần thử trước khi tài khoản bị khóa tạm thời.
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-caption font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Onboarding Intention Selection (Only during Registration) */}
              {isRegister && (
                <div className="space-y-2 mb-4">
                  <label className="text-caption font-semibold text-[#0F172A] block">
                    Mục đích sử dụng của bạn:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIntention('Tenant')}
                      className={`p-3.5 rounded-[14px] border text-left transition-all duration-150 flex flex-col justify-between ${
                        intention === 'Tenant'
                          ? 'border-[#00153D] bg-blue-50/40 shadow-clay-card'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div className={`p-2 rounded-xl ${intention === 'Tenant' ? 'bg-[#00153D] text-white' : 'bg-slate-200 text-slate-700'}`}>
                          <Home className="w-4 h-4" />
                        </div>
                        {intention === 'Tenant' && <Check className="w-4 h-4 text-[#00153D]" />}
                      </div>
                      <div>
                        <div className="text-caption font-bold text-[#0F172A]">Khách thuê</div>
                        <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">Tìm phòng & ở ghép</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIntention('Landlord')}
                      className={`p-3.5 rounded-[14px] border text-left transition-all duration-150 flex flex-col justify-between ${
                        intention === 'Landlord'
                          ? 'border-[#00153D] bg-emerald-50/40 shadow-clay-card'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div className={`p-2 rounded-xl ${intention === 'Landlord' ? 'bg-[#00153D] text-white' : 'bg-slate-200 text-slate-700'}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        {intention === 'Landlord' && <Check className="w-4 h-4 text-[#00153D]" />}
                      </div>
                      <div>
                        <div className="text-caption font-bold text-[#0F172A]">Chủ trọ</div>
                        <div className="text-[11px] text-[#64748B] mt-0.5 leading-tight">Đăng tin & cho thuê</div>
                      </div>
                    </button>
                  </div>

                  {intention === 'Landlord' && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Tài khoản Chủ trọ có thể tạo và soạn tin đăng ngay. Tin đăng sẽ được công khai sau khi xác minh danh tính hoặc phòng trọ.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Full Name (Only on Registration) */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Họ và Tên</span>
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Nguyễn Văn An" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Địa chỉ Email</span>
                </label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setRemainingAttempts(null); }}
                  required
                />
              </div>

              {/* Phone (Only on Registration) */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Số điện thoại (khuyến nghị)</span>
                  </label>
                  <Input 
                    type="tel" 
                    placeholder="0912345678" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-caption font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Mật khẩu</span>
                  </label>
                  {!isRegister && (
                    <Link to="/auth/reset" className="text-xs text-[#2563EB] hover:underline font-medium">
                      Quên mật khẩu?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Ít nhất 6 ký tự" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA / Risk Challenge Box */}
              {requiresCaptcha && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-caption">
                    <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Mã bảo vệ (CAPTCHA):</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRefreshCaptcha}
                      className="text-blue-700 hover:text-blue-900 flex items-center gap-1 text-[11px] font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Đổi câu hỏi</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-800 text-sm tracking-wider select-none min-w-[90px] text-center shadow-xs">
                      {captchaQuestion || '...'}
                    </div>
                    <Input
                      type="text"
                      placeholder="Nhập kết quả"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Action Submit Button */}
              <Button 
                type="submit" 
                fullWidth 
                disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)} 
                className="min-h-[44px] mt-2"
              >
                {loading 
                  ? 'Đang xác thực an toàn...' 
                  : isRegister 
                    ? `Đăng ký tài khoản (${intention === 'Landlord' ? 'Chủ trọ' : 'Khách thuê'})` 
                    : 'Đăng nhập'}
              </Button>
            </form>

            {/* Quick Demo Fill (Available for Developer and Evaluator testing) */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-caption">
              <div className="flex items-center justify-between text-[#64748B]">
                <span className="flex items-center gap-1 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tài khoản kiểm thử nhanh:</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('Tenant')}
                  className="px-2.5 py-1 rounded-[10px] text-[12px] font-medium bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] border border-[#E2E8F0] active:scale-95 transition-all"
                >
                  Khách thuê
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('Landlord')}
                  className="px-2.5 py-1 rounded-[10px] text-[12px] font-medium bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] border border-[#E2E8F0] active:scale-95 transition-all"
                >
                  Chủ trọ
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('Admin')}
                  className="px-2.5 py-1 rounded-[10px] text-[12px] font-medium bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A] border border-[#E2E8F0] active:scale-95 transition-all"
                >
                  Quản trị viên
                </button>
              </div>
            </div>

            {/* Bottom Toggle Note */}
            <div className="mt-5 text-center">
              <button 
                type="button" 
                onClick={() => toggleTab(!isRegister)} 
                className="text-caption text-[#00153D] hover:underline font-semibold"
              >
                {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Tạo tài khoản mới'}
              </button>
            </div>
          </div>
        )}
      </Card>
    </PageMotion>
  );
}
