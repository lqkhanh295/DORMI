import { useState, useMemo } from 'react';
import { mockAdminUsers } from '../../data/mockData';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockAdminUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tenant' | 'landlord'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    setUsers(users.map((u) => u.id === id ? { ...u, status: nextStatus } : u));
    
    if (nextStatus === 'blocked') {
      triggerToast('🔒 Tài khoản người dùng đã được tạm khóa.');
    } else {
      triggerToast('🔓 Tài khoản người dùng đã được mở khóa hoạt động.');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="pt-20 min-h-screen bg-slate-50 font-sans pb-12">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {toastMsg && (
          <div
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              backgroundColor: 'var(--color-text-primary)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 300,
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {toastMsg}
          </div>
        )}

        {/* Title bar */}
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            👥 Quản Lý Người Dùng
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Xem danh sách tài khoản sinh viên và chủ trọ, thực hiện mở hoặc khóa quyền truy cập khi có vi phạm.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '14px' }}>🔍</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'tenant' | 'landlord')}
            className="input-field"
            style={{ minWidth: '160px' }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="tenant">🎓 Sinh viên thuê trọ</option>
            <option value="landlord">🏠 Chủ trọ đăng tin</option>
          </select>
        </div>

        {/* Users Table Grid Layout */}
        <div className="card-container" style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                  <th style={{ padding: '14px 20px' }}>Tên người dùng</th>
                  <th style={{ padding: '14px 20px' }}>Địa chỉ Email</th>
                  <th style={{ padding: '14px 20px' }}>Vai trò</th>
                  <th style={{ padding: '14px 20px' }}>Ngày tham gia</th>
                  <th style={{ padding: '14px 20px' }}>Trạng thái</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={user.avatar} alt={user.fullName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ color: 'var(--color-text-primary)' }}>{user.fullName}</strong>
                        {user.university && <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>{user.university}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className="badge-tag" style={{
                        background: user.role === 'tenant' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: user.role === 'tenant' ? 'var(--color-info)' : 'var(--color-primary)'
                      }}>
                        {user.role === 'tenant' ? 'Sinh viên' : 'Chủ trọ'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>{new Date(user.joinedAt).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: user.status === 'active' ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 700 }}>
                        {user.status === 'active' ? 'Hoạt động' : 'Đang khóa'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={user.status === 'active' ? 'btn-danger' : 'btn-primary'}
                        style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: 'var(--radius-sm)' }}
                      >
                        {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
