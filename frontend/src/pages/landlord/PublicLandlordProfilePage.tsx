import { Link, useParams } from 'react-router-dom';
import { useAppDataStore } from '../../store/useAppDataStore';

export default function PublicLandlordProfilePage() {
  const { landlordId } = useParams<{ landlordId: string }>();
  const { landlords, rooms } = useAppDataStore();
  const landlord = landlords.find((item) => item.id === landlordId) || landlords[0];
  const landlordRooms = rooms.filter((room) => room.landlordId === landlord.id);
  const reviews = landlordRooms.flatMap((room) => room.reviews.map((review) => ({ ...review, roomTitle: room.title })));

  return (
    <main className="pt-20 min-h-screen bg-slate-50 pb-12 font-sans">
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        <section
          className="card-container"
          style={{
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          <div style={{ height: 180, background: 'var(--gradient-hero)' }} />
          <div style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -64 }}>
            <img
              src={landlord.avatar}
              alt={landlord.fullName}
              style={{ width: 116, height: 116, borderRadius: '50%', border: '4px solid white', boxShadow: 'var(--shadow-md)', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800 }}>{landlord.fullName}</h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span className="badge-tag" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)' }}>
                  {landlord.kycStatus === 'verified' ? '✓ Đã xác thực' : '⏳ Chưa xác thực'}
                </span>
                {landlord.isPremium && (
                  <span className="badge-tag" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--color-accent)' }}>
                    💎 Chủ trọ VIP
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 10, maxWidth: 760 }}>{landlord.bio}</p>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 20 }}>
          {[
            ['Đánh giá', `${landlord.rating}/5`],
            ['Lượt phản hồi', `${landlord.responseRate}%`],
            ['Thời gian phản hồi', landlord.responseTime],
            ['Phòng đang cho thuê', `${landlord.activeRooms}`],
          ].map(([label, value]) => (
            <div key={label} className="card-container" style={{ padding: 20, background: '#FFFFFF' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{label}</span>
              <strong style={{ display: 'block', marginTop: 6, fontSize: 20 }}>{value}</strong>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Phòng đang quản lý</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {landlordRooms.map((room) => (
              <Link key={room.id} to={`/tenant/explore/${room.id}`} className="card-container card-hover" style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden', background: '#FFFFFF' }}>
                <img src={room.images[0]} alt={room.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800 }}>{room.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 12, marginTop: 6 }}>{room.address}</p>
                  <strong style={{ color: 'var(--color-success)', display: 'block', marginTop: 10 }}>{room.price.toLocaleString('vi-VN')} đ/tháng</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Đánh giá từ người thuê</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="card-container" style={{ padding: 18, background: '#FFFFFF' }}>
                <strong>{review.authorName}</strong>
                <span style={{ color: 'var(--color-warning)', marginLeft: 8 }}>{'★'.repeat(review.rating)}</span>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>{review.content}</p>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{review.roomTitle}</span>
              </div>
            )) : (
              <div className="card-container" style={{ padding: 28, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Chưa có đánh giá công khai.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
