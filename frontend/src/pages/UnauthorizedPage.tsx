import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  const goHome = () => {
    if (role === 'tenant') navigate('/tenant/dashboard');
    else if (role === 'landlord') navigate('/landlord/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <main className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center px-6 font-sans">
      <section className="text-center max-w-xl">
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔒</div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            background: 'var(--gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          403
        </h1>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 16 }}>Bạn không có quyền truy cập trang này</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 10, fontSize: 14 }}>
          DORMI đã chặn truy cập để bảo vệ dữ liệu theo đúng vai trò tài khoản.
        </p>
        <button onClick={goHome} className="btn-primary btn-press" style={{ marginTop: 24 }}>
          Về trang của tôi
        </button>
      </section>
    </main>
  );
}
