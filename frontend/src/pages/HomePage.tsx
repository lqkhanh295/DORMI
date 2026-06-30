import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockRooms } from '../data/mockData';
import { useAuthStore } from '../store/useAuthStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant');

  // Filter featured rooms
  const featuredRooms = mockRooms.filter((room) => room.isFeatured).slice(0, 3);

  const handleCTAClick = (roleType: 'tenant' | 'landlord') => {
    if (isAuthenticated) {
      if (role === roleType) {
        navigate(roleType === 'tenant' ? '/tenant/explore' : '/landlord/dashboard');
      } else {
        navigate(role === 'tenant' ? '/tenant/explore' : '/landlord/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-main)', backgroundColor: 'var(--color-surface)' }}>
      
      {/* SECTION 1: HERO */}
      <section
        style={{
          background: 'var(--gradient-hero)',
          minHeight: '90vh',
          padding: '120px 32px 80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow circles */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: '320px',
            height: '320px',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: '350px',
            height: '350px',
            background: 'rgba(249, 115, 22, 0.1)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: '1200px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '48px',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
          className="md:grid-cols-2"
        >
          {/* Hero Left Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 16px',
                marginBottom: '24px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              <span>🏠</span>
              <span>Nền tảng #1 tìm phòng cho sinh viên TP.HCM</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2,
                marginBottom: '20px',
              }}
            >
              Tìm phòng trọ & bạn ở ghép
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #A78BFA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                an toàn, thông minh
              </span>
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontSize: '16px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                maxWidth: '480px',
                marginBottom: '36px',
              }}
            >
              Hơn 500+ phòng trọ đã xác thực eKYC, 1.200+ sinh viên tin dùng tại TP.HCM. Khám phá không gian sống lý tưởng ngay hôm nay!
            </p>

            {/* CTA Actions */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleCTAClick('tenant')}
                className="btn-primary"
                style={{ fontSize: '15px', padding: '14px 28px' }}
              >
                Tìm phòng ngay
              </button>
              <button
                onClick={() => handleCTAClick('landlord')}
                className="btn-secondary"
                style={{
                  fontSize: '15px',
                  padding: '14px 28px',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                }}
              >
                Đăng tin cho thuê
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', width: '100%' }}>
              <span style={{ fontSize: '13px', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--color-success)' }}>✓</span> Đã xác thực eKYC
              </span>
              <span style={{ fontSize: '13px', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--color-success)' }}>✓</span> Bảo mật tiền cọc
              </span>
              <span style={{ fontSize: '13px', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--color-warning)' }}>★</span> 4.8/5 Đánh giá trung bình
              </span>
            </div>
          </div>

          {/* Hero Right Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: 'var(--shadow-lg)',
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
                alt="Minh họa ứng dụng DORMI"
                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                  ✓ ĐÃ XÁC THỰC
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>📍 Quận 10, TP.HCM</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Phòng trọ cao cấp gần ĐH Bách Khoa
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>3.5 triệu<span style={{ fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>/tháng</span></span>
                <span style={{ fontSize: '12px', color: 'var(--color-warning)' }}>★ 4.8 (47 đánh giá)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: '40px 32px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
          <div>
            <h4 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>500+</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Phòng trọ đã xác thực</p>
          </div>
          <div>
            <h4 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>1.200+</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Sinh viên tin dùng</p>
          </div>
          <div>
            <h4 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>98%</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Phòng khớp thông tin thực</p>
          </div>
          <div>
            <h4 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>4.8★</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Đánh giá trung bình</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section id="features" style={{ backgroundColor: 'var(--color-surface-2)', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Tại sao chọn DORMI?</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Các tính năng đột phá mang lại trải nghiệm thuê nhà thông minh nhất</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Card 1 */}
            <div className="card-container card-hover" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '36px' }}>🛡️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Xác thực & Tin cậy</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Mọi chủ trọ trên hệ thống đều được xác minh danh tính qua quy trình eKYC nghiêm ngặt. Hệ thống điểm tin cậy (Độ tin cậy) công khai minh bạch.
              </p>
            </div>
            {/* Card 2 */}
            <div className="card-container card-hover" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '36px' }}>🗺️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Bản đồ thông minh</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Tìm kiếm trực quan theo bán kính quanh trường Đại học của bạn. Lọc nhanh các phòng trống, vị trí địa lý, an ninh tối đa.
              </p>
            </div>
            {/* Card 3 */}
            <div className="card-container card-hover" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '36px' }}>🤝</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Ghép bạn ở ghép</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Thuật toán AI phân tích lối sống (giờ sinh hoạt, thói quen vệ sinh, nấu ăn) giúp đề xuất những người bạn ở ghép lý tưởng nhất cho bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: STEPS */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: '80px 32px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Bắt đầu chỉ trong 3 bước</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Đơn giản, nhanh chóng và hiệu quả</p>
          </div>

          {/* Switch tab */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{ background: 'var(--color-surface-3)', padding: '4px', borderRadius: 'var(--radius-md)', display: 'flex' }}>
              <button
                onClick={() => setActiveTab('tenant')}
                style={{
                  border: 'none',
                  background: activeTab === 'tenant' ? 'white' : 'transparent',
                  color: activeTab === 'tenant' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: '8px 24px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🎓 Người thuê phòng
              </button>
              <button
                onClick={() => setActiveTab('landlord')}
                style={{
                  border: 'none',
                  background: activeTab === 'landlord' ? 'white' : 'transparent',
                  color: activeTab === 'landlord' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: '8px 24px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🏠 Chủ nhà cho thuê
              </button>
            </div>
          </div>

          {/* Steps Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {activeTab === 'tenant' ? (
              <>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Tạo tài khoản sinh viên</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Cung cấp thông tin cơ bản và trường Đại học bạn đang theo học để tối ưu hóa gợi ý.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Tìm kiếm & lọc thông minh</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Sử dụng công cụ bản đồ GIS nâng cao, tham quan 3D Panorama và đối sánh lối sống.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Đặt lịch & Trao đổi an toàn</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Nhắn tin trực tiếp với chủ trọ để thương lượng, hẹn xem phòng thực tế và đặt cọc bảo đảm.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Đăng ký & Xác thực eKYC</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Hoàn tất định danh cá nhân bằng CMND/CCCD để có dấu tích xanh xác minh uy tín.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Đăng tin phòng trực quan</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Cung cấp hình ảnh chất lượng, tiện nghi phòng, tọa độ GPS và ảnh Panorama 360°.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Nhận khách thuê & Quản lý</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Theo dõi các yêu cầu xem phòng, phê duyệt lịch hẹn nhanh và trao đổi với sinh viên qua hộp chat.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURED ROOMS */}
      <section style={{ backgroundColor: 'var(--color-surface-2)', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Phòng trọ nổi bật</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>Các phòng được xác thực, đánh giá cao nhất</p>
            </div>
            <Link
              to="/tenant/explore"
              style={{
                textDecoration: 'none',
                color: 'var(--color-primary)',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Xem tất cả phòng →
            </Link>
          </div>

          {/* Grid 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {featuredRooms.map((room) => (
              <div
                key={room.id}
                className="card-container card-hover"
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}
              >
                <div style={{ position: 'relative', height: '220px' }}>
                  <img src={room.images[0]} alt={room.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    VIP NỔI BẬT
                  </span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-success)' }}>
                      {(room.price / 1000000).toFixed(1)}M<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/tháng</span>
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      📏 {room.area}m²
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '44px' }}>
                    {room.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span>📍</span> {room.address}
                  </p>
                  
                  {/* Amenities */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {room.amenities.slice(0, 3).map((am) => (
                      <span key={am} className="badge-tag" style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}>
                        {am}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="badge-tag" style={{ background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}>
                        +{room.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={room.landlordAvatar} alt={room.landlordName} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{room.landlordName}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      🛡️ Score: {room.trustScore}%
                    </span>
                  </div>

                  <Link
                    to={`/tenant/explore/${room.id}`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', textAlign: 'center', fontSize: '13px', padding: '10px 0', marginTop: '8px' }}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA BANNER */}
      <section style={{ padding: '80px 32px', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Card Tenant */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Bạn đi tìm phòng trọ?</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '12px', lineHeight: 1.6 }}>
                Tìm kiếm phòng trọ chất lượng cao nhất, trải nghiệm thực tế ảo trực tuyến và kết nối bạn cùng phòng thích ứng.
              </p>
            </div>
            <button
              onClick={() => handleCTAClick('tenant')}
              className="btn-primary"
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                border: 'none',
              }}
            >
              Tìm phòng ngay
            </button>
          </div>

          {/* Card Landlord */}
          <div
            style={{
              background: 'var(--gradient-brand)',
              borderRadius: 'var(--radius-xl)',
              padding: '40px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Bạn muốn cho thuê?</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '12px', lineHeight: 1.6 }}>
                Đăng tin cho thuê nhanh chóng, tiếp cận hơn 1000+ sinh viên TP.HCM mỗi tháng và duyệt lịch đặt hẹn nhanh gọn.
              </p>
            </div>
            <button
              onClick={() => handleCTAClick('landlord')}
              className="btn-primary"
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-primary)',
                border: 'none',
              }}
            >
              Đăng tin cho thuê
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '64px 32px 32px', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          <div>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: '20px', marginBottom: '16px' }}>DORMI</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>Nền tảng tìm phòng trọ và đối sánh bạn cùng phòng thông minh hàng đầu dành cho sinh viên tại TP.HCM.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Tính năng</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>Bản đồ tìm phòng</li>
              <li>Tham quan 360° VR</li>
              <li>Ghép bạn ở ghép AI</li>
              <li>Nhắn tin trực tuyến</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Hỗ trợ</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>Điều khoản dịch vụ</li>
              <li>Chính sách bảo mật</li>
              <li>Quy chế thanh toán cọc</li>
              <li>Báo cáo vi phạm</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Liên hệ</h4>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              📧 support@dormi.vn
              <br />
              📞 1900 123 456
              <br />
              📍 Q.10, TP. Hồ Chí Minh
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '32px', textAlign: 'center', fontSize: '12px' }}>
          <p>© 2025 DORMI. Nền tảng tìm phòng trọ thông minh cho sinh viên. Thiết kế bởi Antigravity.</p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

    </div>
  );
}
