import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ContentModeration() {
  const [reports, setReports] = useState([
    { id: 1, type: 'Tin đăng', target: 'Căn hộ 1 phòng ngủ cao cấp - Thảo Điền', reason: 'Ảnh giả mạo', reporter: 'alex.nguyen', status: 'Chờ xử lý' },
    { id: 2, type: 'Người dùng', target: 'Le Van B', reason: 'Tin nhắn rác', reporter: 'minh.tran', status: 'Chờ xử lý' },
  ]);

  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const handleAction = (id: number, action: 'takedown' | 'ignore') => {
    setReports(reports.filter(r => r.id !== id));
    setSelectedReport(null);
    alert(`Đã ${action === 'takedown' ? 'gỡ' : 'bỏ qua'} báo cáo thành công.`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Kiểm duyệt nội dung</h1>
          <p className="text-text-secondary">Xem xét các tin đăng và hành vi người dùng bị báo cáo.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel - Queue */}
        <div className="w-1/3 flex flex-col bg-white border border-border-subtle rounded-md overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border-subtle bg-surface">
            <h3 className="font-semibold text-text-primary flex justify-between">
              Báo cáo chờ xử lý
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-pill text-xs">{reports.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {reports.map(report => (
              <div 
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-3 rounded-md cursor-pointer border transition-micro ${selectedReport === report.id ? 'bg-primary-soft border-primary-soft' : 'bg-white border-border-subtle hover:border-primary-soft'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase">{report.type}</span>
                  <span className="text-xs text-text-secondary">2 giờ trước</span>
                </div>
                <p className="font-medium text-text-primary text-sm line-clamp-1">{report.target}</p>
                <p className="text-xs text-text-secondary mt-1">Lý do: <span className="font-medium">{report.reason}</span></p>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="p-8 text-center text-text-secondary text-sm">
                Không có báo cáo chờ xử lý.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden flex flex-col">
          {selectedReport ? (
            <>
              <div className="p-6 border-b border-border-subtle">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary mb-1">Chi tiết báo cáo</h2>
                    <p className="text-sm text-text-secondary">Người báo cáo: <span className="font-medium">{reports.find(r => r.id === selectedReport)?.reporter}</span></p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-pill text-sm font-bold">Chờ xem xét</span>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <Card className="p-4 bg-surface border-dashed border-border-subtle">
                  <h4 className="font-semibold text-text-primary mb-2">Đối tượng bị báo cáo</h4>
                  <p className="text-text-primary">{reports.find(r => r.id === selectedReport)?.target}</p>
                </Card>
                <Card className="p-4 bg-red-50 border-red-100 mt-4 text-red-900">
                  <h4 className="font-semibold mb-2 text-red-800">Lý do vi phạm</h4>
                  <p>{reports.find(r => r.id === selectedReport)?.reason}</p>
                </Card>
              </div>
              <div className="p-6 border-t border-border-subtle bg-surface flex justify-end gap-3">
                <Button variant="secondary" onClick={() => handleAction(selectedReport, 'ignore')}>Bỏ qua báo cáo</Button>
                <Button variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500" onClick={() => handleAction(selectedReport, 'takedown')}>Gỡ nội dung</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
              <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Chọn một báo cáo từ hàng đợi để xem xét</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
