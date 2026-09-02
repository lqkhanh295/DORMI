import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export default function ContentModeration() {
  const [reports, setReports] = useState([
    { id: 1, type: 'Tin đăng', target: 'Căn hộ 1 phòng ngủ cao cấp - Thảo Điền', reason: 'Ảnh giả mạo', reporter: 'alex.nguyen', status: 'Chờ xử lý' },
    { id: 2, type: 'Người dùng', target: 'Le Van B', reason: 'Tin nhắn rác', reporter: 'minh.tran', status: 'Chờ xử lý' },
  ]);

  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const handleAction = (id: number, action: 'takedown' | 'ignore') => {
    setReports(reports.filter(r => r.id !== id));
    setSelectedReport(null);
    toast.success(`Đã ${action === 'takedown' ? 'gỡ' : 'bỏ qua'} báo cáo thành công.`);
  };

  // ponytail: ContentModeration using Level 2 Soft Clay queue container and Level 1 Primary Clay detail panel
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F5F7FA]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 font-bold text-[#0F172A]">Kiểm duyệt nội dung</h1>
          <p className="text-body text-[#64748B]">Xem xét các tin đăng và hành vi người dùng bị báo cáo.</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Panel - Queue */}
        <div className="w-1/3 flex flex-col bg-white rounded-[18px] shadow-clay-soft overflow-hidden border border-[#E2E8F0]">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FA]">
            <h3 className="font-bold text-h3 text-[#0F172A] flex justify-between items-center">
              Báo cáo chờ xử lý
              <span className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA] px-2.5 py-0.5 rounded-full text-caption">{reports.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {reports.map(report => (
              <div 
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 rounded-[14px] cursor-pointer transition-all ${selectedReport === report.id ? 'bg-white shadow-clay-primary border-2 border-[#00153D]' : 'bg-[#F5F7FA] border border-[#E2E8F0] hover:bg-white'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-caption font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] px-2 py-0.5 rounded-full">{report.type}</span>
                  <span className="text-caption text-[#64748B]">2 giờ trước</span>
                </div>
                <p className="font-semibold text-[#0F172A] text-body line-clamp-1">{report.target}</p>
                <p className="text-caption text-[#64748B] mt-1">Lý do: <span className="font-semibold text-[#C62828]">{report.reason}</span></p>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="p-8 text-center text-[#64748B] text-body">
                Không có báo cáo chờ xử lý.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 bg-white rounded-[18px] shadow-clay-primary overflow-hidden flex flex-col border-none">
          {selectedReport ? (
            <>
              <div className="p-6 border-b border-[#E2E8F0]">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-h2 font-bold text-[#0F172A] mb-1">Chi tiết báo cáo</h2>
                    <p className="text-caption text-[#64748B]">Người báo cáo: <span className="font-semibold text-[#0F172A]">{reports.find(r => r.id === selectedReport)?.reporter}</span></p>
                  </div>
                  <span className="bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] px-3 py-1 rounded-full text-caption font-bold">Chờ xem xét</span>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <Card className="p-4 bg-[#F5F7FA] shadow-clay-inset rounded-[12px] border border-[#E2E8F0]">
                  <h4 className="font-semibold text-caption text-[#64748B] uppercase mb-2">Đối tượng bị báo cáo</h4>
                  <p className="text-body font-bold text-[#0F172A]">{reports.find(r => r.id === selectedReport)?.target}</p>
                </Card>
                <Card className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] text-[#C62828]">
                  <h4 className="font-semibold text-caption uppercase mb-2">Lý do vi phạm</h4>
                  <p className="text-body font-bold">{reports.find(r => r.id === selectedReport)?.reason}</p>
                </Card>
              </div>
              <div className="p-6 border-t border-[#E2E8F0] bg-[#F5F7FA] flex justify-end gap-3">
                <Button variant="secondary" onClick={() => handleAction(selectedReport, 'ignore')}>Bỏ qua báo cáo</Button>
                <Button variant="secondary" className="bg-[#FEF2F2] text-[#C62828] border border-[#FECACA]" onClick={() => handleAction(selectedReport, 'takedown')}>Gỡ nội dung</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#64748B]">
              <p className="text-body font-semibold">Chọn một báo cáo từ hàng đợi để xem xét.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
