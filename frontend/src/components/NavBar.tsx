import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppDataStore } from '../store/useAppDataStore';

export default function NavBar() {
  const { isAuthenticated, role, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { notifications, markAllNotificationsRead } = useAppDataStore();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    navigate('/', { replace: true });
    setTimeout(() => {
      logout();
    }, 0);
  };

  const getLogoRedirect = () => {
    if (!isAuthenticated) return '/';
    if (role === 'tenant') return '/tenant/explore';
    if (role === 'landlord') return '/landlord/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  // 4 items in middle centered horizontally
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Khám phá', to: '/tenant/explore' },
        { label: 'Tính năng', to: '#features' },
        { label: 'Về chúng tôi', to: '#about' },
        { label: 'Giá dịch vụ', to: '#pricing' },
      ];
    }
    if (role === 'tenant') {
      return [
        { label: 'Khám phá', to: '/tenant/explore' },
        { label: 'Bạn ở ghép', to: '/tenant/roommate' },
        { label: 'Tin nhắn', to: '/tenant/chat' },
        { label: 'Tổng quan', to: '/tenant/dashboard' },
      ];
    }
    if (role === 'landlord') {
      return [
        { label: 'Tổng quan', to: '/landlord/dashboard' },
        { label: 'Quản lý phòng', to: '/landlord/rooms' },
        { label: 'Lịch hẹn', to: '/landlord/appointments' },
        { label: 'Tin nhắn', to: '/landlord/chat' },
      ];
    }
    if (role === 'admin') {
      return [
        { label: 'Tổng quan', to: '/admin/dashboard' },
        { label: 'Duyệt tin đăng', to: '/admin/rooms' },
        { label: 'Duyệt eKYC', to: '/admin/kyc' },
        { label: 'Quản lý người dùng', to: '/admin/users' },
      ];
    }
    return [];
  };

  const navItems = getNavItems();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    markAllNotificationsRead();
  };

  const handleNotificationClick = (_id: string, type: string) => {
    setShowNotifications(false);
    if (role === 'tenant') {
      if (type === 'ticket') navigate('/tenant/dashboard');
      if (type === 'voucher') navigate('/tenant/dashboard');
      if (type === 'match') navigate('/tenant/roommate');
    } else if (role === 'landlord') {
      if (type === 'appointment') navigate('/landlord/appointments');
    }
  };

  // Adjust Navbar theme for Admin (Purple #1E1B4B background)
  const isAdmin = isAuthenticated && role === 'admin';
  const navBg = isAdmin ? '#1E1B4B' : 'rgba(255, 255, 255, 0.95)';
  const navBorder = isAdmin ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0';
  const textColor = isAdmin ? '#E2E8F0' : '#475569';
  const activeTextColor = isAdmin ? '#FFFFFF' : '#4338CA';
  const logoColor = isAdmin ? '#FFFFFF' : '#4338CA';

  return (
    <nav
      className="navbar-fixed"
      style={{
        background: navBg,
        borderBottom: `1px solid ${navBorder}`,
        color: textColor,
      }}
    >
      {/* Left Area: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to={getLogoRedirect()}
          style={{
            textDecoration: 'none',
            fontSize: '22px',
            fontWeight: 800,
            color: logoColor,
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>DORMI</span>
          {role === 'admin' && (
            <span
              style={{
                fontSize: '10px',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              ADMIN
            </span>
          )}
        </Link>
      </div>

      {/* Middle Area: Centered horizontally, exactly 4 navigation items */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return item.to.startsWith('#') ? (
            <a
              key={item.label}
              href={item.to}
              style={{
                textDecoration: 'none',
                color: textColor,
                fontSize: '14px',
                fontWeight: 500,
                padding: '8px 0',
                position: 'relative',
              }}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.to}
              to={item.to}
              style={{
                textDecoration: 'none',
                color: isActive ? activeTextColor : textColor,
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                padding: '8px 0',
                position: 'relative',
              }}
            >
              {item.label}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    backgroundColor: activeTextColor,
                    borderRadius: '2px',
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Area: Notifications + Profile Dropdown or Auth buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: textColor,
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'var(--color-error)',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '15px',
                      height: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '320px',
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    overflow: 'hidden',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'var(--color-surface-2)',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>Thông báo</span>
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id, n.type)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          backgroundColor: n.isRead ? '#FFFFFF' : 'var(--color-surface-3)',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: '16px', marginTop: '2px' }}>
                          {n.type === 'appointment' ? '📅' : n.type === 'ticket' ? '🔧' : n.type === 'voucher' ? '🎁' : '🤝'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '12px', margin: 0, color: 'var(--color-text-secondary)', fontWeight: n.isRead ? 400 : 600 }}>
                            {n.message}
                          </p>
                          <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                            {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                        Không có thông báo mới nào
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={user?.avatar || 'https://i.pravatar.cc/100?img=11'}
                  alt={user?.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    border: '2px solid white',
                    boxShadow: 'var(--shadow-sm)',
                    objectFit: 'cover',
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: isAdmin ? '#fff' : textColor }}>▼</span>
              </div>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '200px',
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    overflow: 'hidden',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {user?.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {role === 'tenant' ? 'Người thuê' : role === 'landlord' ? 'Chủ trọ' : 'Quản trị viên'}
                    </p>
                  </div>
                  <div style={{ padding: '6px 0' }}>
                    {role === 'tenant' && (
                      <>
                        <Link
                          to="/tenant/dashboard?tab=profile"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          👤 Hồ sơ
                        </Link>
                        <Link
                          to="/tenant/dashboard?tab=saved"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          ❤️ Phòng đã lưu
                        </Link>
                        <Link
                          to="/tenant/dashboard?tab=vouchers"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          🎁 Ưu đãi của tôi
                        </Link>
                        <Link
                          to="/tenant/dashboard?tab=profile"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          ⚙️ Cài đặt
                        </Link>
                      </>
                    )}
                    {role === 'landlord' && (
                      <>
                        <Link
                          to="/landlord/dashboard?tab=profile"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          👤 Hồ sơ
                        </Link>
                        <Link
                          to="/landlord/rooms/new"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          ➕ Đăng tin mới
                        </Link>
                        <Link
                          to="/landlord/dashboard?tab=leads"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          🤝 Gợi ý khách thuê
                        </Link>
                        <Link
                          to="/landlord/dashboard?tab=vip"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          💎 Nâng cấp VIP
                        </Link>
                        <Link
                          to="/landlord/dashboard?tab=profile"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          ⚙️ Cài đặt
                        </Link>
                      </>
                    )}
                    {role === 'admin' && (
                      <>
                        <Link
                          to="/admin/settings"
                          onClick={() => setShowProfileMenu(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          className="hover-bg"
                        >
                          ⚙️ Cài đặt hệ thống
                        </Link>
                      </>
                    )}
                    <div style={{ height: '1px', background: 'var(--color-border)', margin: '6px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: '12px',
                        color: 'var(--color-error)',
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                background: 'var(--gradient-brand)',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>

      <style>{`
        .hover-bg:hover {
          background-color: var(--color-surface-3);
        }
      `}</style>
    </nav>
  );
}
