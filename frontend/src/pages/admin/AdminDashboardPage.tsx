import { mockAdminStats } from '../../data/mockData';

export default function AdminDashboardPage() {
  const stats = mockAdminStats;

  // Monthly statistics for charting
  const chartData = stats.monthlyStats;

  return (
    <div className="pt-20 min-h-screen bg-slate-50 font-sans pb-12">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Title and header */}
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-surface-3)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
            HỆ THỐNG QUẢN TRỊ
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            📊 Tổng quan Hệ thống DORMI
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Báo cáo thống kê hoạt động tìm phòng, tài khoản đăng ký và doanh thu toàn nền tảng.
          </p>
        </div>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Tổng người dùng', val: stats.totalUsers, desc: `Sinh viên: ${stats.totalTenants} | Chủ trọ: ${stats.totalLandlords}`, icon: '👥', color: 'var(--color-primary)' },
            { label: 'Tổng số phòng trọ', val: stats.totalRooms, desc: `Hoạt động: ${stats.activeRooms} | Chờ duyệt: ${stats.pendingRooms}`, icon: '🏠', color: 'var(--color-info)' },
            { label: 'Yêu cầu chờ duyệt', val: stats.pendingRooms + stats.pendingKYC, desc: `Phòng trọ: ${stats.pendingRooms} | eKYC: ${stats.pendingKYC}`, icon: '⏳', color: 'var(--color-warning)' },
            { label: 'Báo cáo vi phạm', val: stats.totalReports, desc: `Đang xử lý: ${stats.openReports}`, icon: '⚠️', color: 'var(--color-error)' },
            { label: 'Doanh thu VIP', val: `${stats.platformRevenue.toLocaleString('vi-VN')} đ`, desc: `Tháng này: +87 thành viên`, icon: '💎', color: 'var(--color-success)' },
          ].map((card, i) => (
            <div
              key={i}
              className="card-container"
              style={{ backgroundColor: '#FFFFFF', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {card.label}
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '6px' }}>
                  {card.val}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
                  {card.desc}
                </span>
              </div>
              <span style={{ fontSize: '28px', background: 'var(--color-surface-3)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                {card.icon}
              </span>
            </div>
          ))}
        </div>

        {/* CHARTS & RECENT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:grid-cols-3">
          
          {/* Chart Left panel (2 cols width) */}
          <div className="card-container lg:col-span-2" style={{ backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>📈 Biểu đồ Phát triển Nền tảng (6 Tháng)</h3>
              <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>Tăng trưởng +15%</span>
            </div>

            {/* SVG Visualizer Chart */}
            <div style={{ height: '240px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', paddingTop: '20px' }}>
              {chartData.map((item, idx) => {
                const maxVal = Math.max(...chartData.map((d) => d.users));
                const barHeight = (item.users / maxVal) * 160; // scale to 160px max

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', height: '100%' }} className="group">
                    <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 700, opacity: 0 }} className="group-hover:opacity-100">
                      {item.users}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '44px',
                        background: 'var(--gradient-brand)',
                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                        height: `${barHeight}px`,
                      }}
                      className="card-hover"
                    />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--color-primary)' }} />
                Tổng số Người dùng đăng ký
              </span>
            </div>
          </div>

          {/* Quick Info Status Right (1 col width) */}
          <div className="card-container" style={{ backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              ⚡ Cần xử lý gấp
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface-2)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '20px' }}>⏳</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Phòng chờ phê duyệt</h4>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Hiện có <strong style={{ color: 'var(--color-accent)' }}>8 tin đăng</strong> cần xem duyệt để đưa lên bản đồ.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface-2)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '20px' }}>🛡️</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Xác minh hồ sơ eKYC</h4>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Có <strong style={{ color: 'var(--color-accent)' }}>3 chủ trọ mới</strong> đã gửi ảnh CCCD chờ đối soát.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface-2)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Báo cáo lừa đảo / scam</h4>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Có <strong style={{ color: 'var(--color-error)' }}>2 báo cáo</strong> khiếu nại chất lượng phòng không giống hình ảnh.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
