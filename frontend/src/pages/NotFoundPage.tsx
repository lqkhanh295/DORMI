import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center px-6 font-sans">
      <section className="text-center max-w-xl">
        <h1
          style={{
            fontSize: 84,
            fontWeight: 800,
            background: 'var(--gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 16 }}>Không tìm thấy trang</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 10, fontSize: 14 }}>
          Đường dẫn này không tồn tại hoặc đã được chuyển sang vị trí khác.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Về trang chủ
          </Link>
          <Link to="/tenant/explore" className="btn-primary" style={{ textDecoration: 'none' }}>
            Tìm phòng ngay
          </Link>
        </div>
      </section>
    </main>
  );
}
