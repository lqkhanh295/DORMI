import { useState } from 'react';
import { mockPendingKYC } from '../../data/mockData';

export default function AdminKYCPage() {
  const [kycList, setKycList] = useState(mockPendingKYC);
  const [selectedKyc, setSelectedKyc] = useState<typeof mockPendingKYC[0] | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApprove = (id: string) => {
    setKycList(kycList.filter((k) => k.id !== id));
    setSelectedKyc(null);
    triggerToast('✓ Xác thực định danh eKYC của chủ trọ thành công!');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKyc || !rejectReason.trim()) return;

    setKycList(kycList.filter((k) => k.id !== selectedKyc.id));
    setSelectedKyc(null);
    setShowRejectForm(false);
    setRejectReason('');
    triggerToast('✕ Đã bác bỏ hồ sơ eKYC chủ trọ.');
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
            🛡️ Duyệt Hồ Sơ eKYC Chủ Trọ
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Đối soát ảnh chân dung với ảnh thẻ CCCD để cấp tích xanh uy tín cho tài khoản của chủ nhà.
          </p>
        </div>

        {/* KYC Queue List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {kycList.map((kyc) => (
            <div
              key={kyc.id}
              className="card-container"
              style={{ backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}
            >
              <img
                src={kyc.selfieImage}
                alt={kyc.fullName}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {kyc.fullName}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  📧 {kyc.email} | 📞 {kyc.phone}
                </p>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                  Yêu cầu gửi: {new Date(kyc.submittedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedKyc(kyc)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Xét duyệt
              </button>
            </div>
          ))}

          {kycList.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: '48px' }}>🎉</span>
              <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500 }}>Không có hồ sơ eKYC nào đang chờ xét duyệt!</p>
            </div>
          )}
        </div>

        {/* KYC DETAILED VIEW MODAL */}
        {selectedKyc && (
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
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>XÉT DUYỆT HỒ SƠ ĐỊNH DANH EKYC</span>
                <button
                  onClick={() => {
                    setSelectedKyc(null);
                    setShowRejectForm(false);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--color-text-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Photos Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'center' }}>Mặt trước CCCD</span>
                  <img src={selectedKyc.frontIdImage} alt="Mặt trước" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'center' }}>Mặt sau CCCD</span>
                  <img src={selectedKyc.backIdImage} alt="Mặt sau" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px', textAlign: 'center' }}>Ảnh selfie chân dung</span>
                  <img src={selectedKyc.selfieImage} alt="Selfie" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                </div>
              </div>

              {/* Profile info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--color-surface-2)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', fontSize: '13px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Họ và tên:</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{selectedKyc.fullName}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Số CCCD:</span>
                  <strong>{selectedKyc.cccdNumber}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Ngày sinh:</span>
                  <strong>{new Date(selectedKyc.dateOfBirth).toLocaleDateString('vi-VN')}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Địa chỉ thường trú:</span>
                  <strong>{selectedKyc.address}</strong>
                </div>
              </div>

              {showRejectForm ? (
                <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-error)' }}>Lý do từ chối eKYC:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Lý do không duyệt (ví dụ: Ảnh chân dung mờ, thông tin CCCD không rõ...)"
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
                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="btn-danger"
                    style={{ flex: 1, padding: '12px 0', fontSize: '13px' }}
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    onClick={() => handleApprove(selectedKyc.id)}
                    className="btn-primary btn-press"
                    style={{ flex: 1, padding: '12px 0', fontSize: '13px' }}
                  >
                    Phê duyệt eKYC
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
