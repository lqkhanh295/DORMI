import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockRooms } from '../../data/mockData';
import { useAuthStore } from '../../store/useAuthStore';

export default function LandlordRoomsPage() {
  const { user } = useAuthStore();
  
  // Filter rooms belonging to landlord-001 (default landlord user)
  const landlordId = user?.id || 'landlord-001';
  const initialRooms = mockRooms.filter((r) => r.landlordId === landlordId);

  const [rooms, setRooms] = useState(initialRooms);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang cho thuê' | 'Chờ duyệt' | 'Đã ẩn'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Đã ẩn' ? 'Đang cho thuê' : 'Đã ẩn';
    setRooms(rooms.map((r) => r.id === id ? { ...r, status: nextStatus } : r));
    triggerToast(nextStatus === 'Đã ẩn' ? '✓ Đã ẩn tin đăng phòng trọ.' : '✓ Đã công khai lại tin đăng phòng trọ.');
  };

  const handleDeleteRoom = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin đăng phòng trọ này?')) {
      setRooms(rooms.filter((r) => r.id !== id));
      triggerToast('✓ Đã xóa tin đăng phòng trọ khỏi hệ thống.');
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (statusFilter === 'all') return true;
      return r.status === statusFilter;
    });
  }, [rooms, statusFilter]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              🏠 Quản Lý Phòng Trọ Của Tôi
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Quản lý danh sách, bật/tắt trạng thái hiển thị và kiểm tra lượt tương tác của từng phòng.
            </p>
          </div>
          <Link
            to="/landlord/create-room"
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px', display: 'inline-block' }}
          >
            ➕ Đăng tin mới
          </Link>
        </div>

        {/* Filter bar toolbar */}
        <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Lọc trạng thái:</span>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {[
              { id: 'all' as const, label: 'Tất cả' },
              { id: 'Đang cho thuê' as const, label: 'Đang hoạt động' },
              { id: 'Chờ duyệt' as const, label: 'Chờ duyệt' },
              { id: 'Đã ẩn' as const, label: 'Đang ẩn' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  border: 'none',
                  background: statusFilter === f.id ? 'var(--color-primary)' : 'var(--color-surface-3)',
                  color: statusFilter === f.id ? 'white' : 'var(--color-text-secondary)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Listing Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="card-container"
              style={{ backgroundColor: '#FFFFFF', overflow: 'hidden', display: 'flex', gap: '16px', padding: '16px' }}
            >
              <img
                src={room.images[0]}
                alt={room.title}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="badge-tag" style={{
                      background: room.status === 'Đang cho thuê' ? 'rgba(16, 185, 129, 0.1)' : room.status === 'Chờ duyệt' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(148, 163, 184, 0.15)',
                      color: room.status === 'Đang cho thuê' ? 'var(--color-success)' : room.status === 'Chờ duyệt' ? 'var(--color-warning)' : 'var(--color-text-muted)'
                    }}>
                      {room.status}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700 }}>Score: {room.trustScore}%</span>
                  </div>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.title}</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>📍 {room.address}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-success)' }}>
                    {(room.price / 1000000).toFixed(1)}M/tháng
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleToggleStatus(room.id, room.status)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: 'var(--radius-sm)' }}
                    >
                      {room.status === 'Đã ẩn' ? 'Hiện' : 'Ẩn'}
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="btn-danger"
                      style={{ padding: '4px 8px', fontSize: '11px', borderRadius: 'var(--radius-sm)' }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredRooms.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: '48px' }}>📭</span>
              <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500 }}>Không tìm thấy phòng trọ nào phù hợp.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
