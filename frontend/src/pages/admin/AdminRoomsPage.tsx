import { useState } from 'react';
import { useAppDataStore } from '../../store/useAppDataStore';

export default function AdminRoomsPage() {
  const { pendingRooms, approvePendingRoom, rejectPendingRoom } = useAppDataStore();
  const rooms = pendingRooms;
  const [selectedRoom, setSelectedRoom] = useState<typeof pendingRooms[0] | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Rejection modal
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApprove = (id: string) => {
    approvePendingRoom(id);
    setSelectedRoom(null);
    triggerToast('✓ Tin đăng phòng trọ đã được phê duyệt thành công và đưa lên bản đồ!');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !rejectReason.trim()) return;

    rejectPendingRoom(selectedRoom.id, rejectReason);
    setSelectedRoom(null);
    setShowRejectForm(false);
    setRejectReason('');
    triggerToast('✕ Đã từ chối tin đăng phòng trọ và gửi phản hồi cho chủ nhà.');
  };

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
            🏠 Duyệt Tin Đăng Phòng Trọ
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Kiểm tra thông tin chi tiết phòng trọ mới gửi lên để đảm bảo tính xác thực trước khi công bố.
          </p>
        </div>

        {/* Pending rooms list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card-container"
              style={{ backgroundColor: '#FFFFFF', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <img
                src={room.images[0]}
                alt={room.title}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                    ⏳ CHỜ PHÊ DUYỆT
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {new Date(room.submittedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-primary)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '40px' }}>
                  {room.title}
                </h3>

                <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                  📍 {room.address}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '4px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Giá cho thuê:</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>
                      {(room.price / 1000000).toFixed(1)} triệu<span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/tháng</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '11.5px' }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: '48px' }}>🎉</span>
              <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500 }}>Không có tin đăng phòng trọ nào đang chờ duyệt!</p>
            </div>
          )}
        </div>

        {/* DETAIL VIEW MODAL */}
        {selectedRoom && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 250,
              padding: '24px',
            }}
          >
            <div
              className="card-container animate-fade-in-up"
              style={{
                backgroundColor: '#FFFFFF',
                width: '100%',
                maxWidth: '640px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>CHI TIẾT TIN PHÒNG TRỌ</span>
                <button
                  onClick={() => {
                    setSelectedRoom(null);
                    setShowRejectForm(false);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--color-text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <img
                src={selectedRoom.images[0]}
                alt="Room detail"
                style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedRoom.title}</h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>📍 Địa chỉ: {selectedRoom.address}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', background: 'var(--color-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Giá thuê: </span>
                    <strong style={{ color: 'var(--color-success)' }}>{(selectedRoom.price / 1000000).toFixed(1)}M/tháng</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Diện tích: </span>
                    <strong>{selectedRoom.area} m²</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Người đăng: </span>
                    <strong>{selectedRoom.landlordName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>eKYC chủ trọ: </span>
                    <strong style={{ color: selectedRoom.landlordKYC === 'verified' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {selectedRoom.landlordKYC === 'verified' ? 'Đã xác minh eKYC' : 'Chờ xác minh'}
                    </strong>
                  </div>
                </div>
              </div>

              {showRejectForm ? (
                <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-error)' }}>Lý do từ chối tin đăng:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Nhập lý do từ chối (ví dụ: Hình ảnh không rõ ràng, Địa chỉ không chính xác...)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="input-field"
                    style={{ resize: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-danger btn-press"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Xác nhận Từ chối
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="btn-danger"
                    style={{ flex: 1, padding: '12px 0', fontSize: '13px' }}
                  >
                    Từ chối tin đăng
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRoom.id)}
                    className="btn-primary btn-press"
                    style={{ flex: 1, padding: '12px 0', fontSize: '13px' }}
                  >
                    Phê duyệt tin đăng
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
