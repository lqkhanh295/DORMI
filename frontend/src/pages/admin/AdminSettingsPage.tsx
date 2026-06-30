import { useState } from 'react';

export default function AdminSettingsPage() {
  const [siteTitle, setSiteTitle] = useState('DORMI - Nền tảng Tìm phòng trọ & Bạn ở ghép Sinh viên');
  const [maintenance, setMaintenance] = useState(false);
  const [vipPrice1, setVipPrice1] = useState(199000);
  const [vipPrice3, setVipPrice3] = useState(499000);
  const [vipPrice6, setVipPrice6] = useState(899000);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('✓ Đã lưu thay đổi cấu hình hệ thống thành công!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 font-sans pb-12">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
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
            ⚙️ Cài Đặt Hệ Thống
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Thiết lập cấu hình chung của toàn website DORMI.
          </p>
        </div>

        {/* Settings form container */}
        <div className="card-container" style={{ backgroundColor: '#FFFFFF', padding: '32px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* General Configurations */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                🌐 Cấu hình Chung
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tiêu đề Trang Web (SEO Title)</label>
                  <input
                    type="text"
                    required
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    id="maintenance"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="maintenance" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    Kích hoạt Chế độ Bảo trì (Maintenance Mode)
                  </label>
                </div>
              </div>
            </div>

            {/* VIP Package pricing configurations */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                💎 Bảng giá Gói đẩy tin VIP (Chủ trọ)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Gói 1 Tháng (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={vipPrice1}
                    onChange={(e) => setVipPrice1(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Gói 3 Tháng (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={vipPrice3}
                    onChange={(e) => setVipPrice3(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Gói 6 Tháng (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={vipPrice6}
                    onChange={(e) => setVipPrice6(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary btn-press"
              style={{ width: '100%', padding: '14px 0', marginTop: '8px' }}
            >
              Lưu cấu hình hệ thống
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
