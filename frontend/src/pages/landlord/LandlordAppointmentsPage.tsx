import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAppointments } from '../../data/mockData';
import { useAuthStore } from '../../store/useAuthStore';

export default function LandlordAppointmentsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Load appointments belonging to landlord-001 by default
  const landlordId = user?.id || 'landlord-001';
  const initialAppts = mockAppointments.filter((a) => a.landlordId === landlordId);

  const [appointments, setAppointments] = useState(initialAppts);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    setAppointments(appointments.map((a) => a.id === id ? { ...a, status: newStatus } : a));
    
    if (newStatus === 'confirmed') {
      triggerToast('✓ Đã đồng ý lịch hẹn xem phòng trọ.');
    } else if (newStatus === 'completed') {
      triggerToast('✓ Lịch hẹn đã được đánh dấu là hoàn thành.');
    } else if (newStatus === 'cancelled') {
      triggerToast('✕ Đã hủy lịch hẹn xem phòng trọ.');
    }
  };

  const handleStartChat = (tenantId: string, tenantName: string) => {
    localStorage.setItem('chat_active_contact', JSON.stringify({ id: tenantId, name: tenantName, isRoommate: false }));
    navigate('/landlord/chat');
  };

  const filteredAppts = useMemo(() => {
    return appointments.filter((a) => {
      if (activeTab === 'pending') return a.status === 'pending';
      if (activeTab === 'confirmed') return a.status === 'confirmed';
      if (activeTab === 'completed') return a.status === 'completed';
      if (activeTab === 'cancelled') return a.status === 'cancelled';
      return true;
    });
  }, [appointments, activeTab]);

  return (
    <div className="pt-20 min-h-screen bg-slate-50 font-sans pb-12">
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
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
            📅 Lịch Hẹn Xem Phòng Trọ
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Phê duyệt các lịch đăng ký hẹn gặp xem phòng trực tiếp của sinh viên thuê trọ.
          </p>
        </div>

        {/* Categories Toolbar tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '16px' }}>
          {[
            { id: 'pending' as const, label: 'Chờ xác nhận', icon: '⏳' },
            { id: 'confirmed' as const, label: 'Đã đồng ý', icon: '✅' },
            { id: 'completed' as const, label: 'Đã hoàn thành', icon: '💜' },
            { id: 'cancelled' as const, label: 'Đã hủy', icon: '❌' },
          ].map((tab) => {
            const count = appointments.filter((a) => a.status === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: 'none',
                  background: 'none',
                  paddingBottom: '12px',
                  borderBottom: activeTab === tab.id ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span style={{ fontSize: '10px', background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Appointments List Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAppts.map((app) => (
            <div
              key={app.id}
              className="card-container animate-fade-in-up"
              style={{ backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{app.roomTitle}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>📍 {app.roomAddress}</p>
                </div>
                <span className="badge-tag" style={{
                  background: app.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'completed' ? 'rgba(167, 139, 250, 0.1)' : app.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: app.status === 'confirmed' ? 'var(--color-success)' : app.status === 'completed' ? '#8B5CF6' : app.status === 'cancelled' ? 'var(--color-error)' : 'var(--color-warning)'
                }}>
                  {app.status === 'confirmed' ? 'Đã xác nhận' : app.status === 'completed' ? 'Hoàn thành' : app.status === 'cancelled' ? 'Đã hủy' : 'Đang chờ duyệt'}
                </span>
              </div>

              {/* Time and contact card detail */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: 'var(--color-surface-2)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} className="md:grid-cols-2">
                <div style={{ fontSize: '13px' }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>🕒 Thời gian hẹn:</p>
                  <strong style={{ display: 'block', marginTop: '4px', color: 'var(--color-text-primary)' }}>
                    {new Date(app.scheduledAt).toLocaleDateString('vi-VN')} vào lúc {new Date(app.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </strong>
                </div>
                <div style={{ fontSize: '13px' }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>👤 Người hẹn gặp:</p>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{app.tenantName}</strong>
                  {app.tenantPhone && <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>📞 {app.tenantPhone}</span>}
                </div>
              </div>

              {app.note && (
                <div style={{ background: 'var(--color-surface-3)', borderLeft: '3px solid var(--color-primary)', padding: '10px 14px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '12.5px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  💬 Ghi chú của sinh viên: "{app.note}"
                </div>
              )}

              {/* Actions details */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleStartChat(app.tenantId, app.tenantName)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  💬 Trò chuyện
                </button>
                
                {app.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                      className="btn-danger"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                      className="btn-primary btn-press"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Xác nhận
                    </button>
                  </>
                )}

                {app.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'completed')}
                    className="btn-primary btn-press"
                    style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: 'var(--color-success)' }}
                  >
                    Đánh dấu Hoàn thành
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredAppts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: '48px' }}>📭</span>
              <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500 }}>Không có lịch hẹn nào ở trạng thái này.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
